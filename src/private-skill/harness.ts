/**
 * Shared harness for interacting with the PrivateSkill contract.
 *
 * Owns the four things every consumer (deploy, cli, tests, backend) needs:
 *   1. Path/config for the compiled contract artifacts.
 *   2. Dynamic loading of the compiled contract into a `CompiledContract`.
 *   3. Construction of the `ContractProviders` (wallet, indexer, zk-config,
 *      proof-server) — parameterized by contract name so multiple contracts
 *      could live side by side.
 *   4. Deploy / find helpers that keep the private-state id consistent.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import {
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import type { NetworkConfig } from '../network';
import type { WalletContext } from '../wallet';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

import * as Rx from 'rxjs';
import type { NetworkId } from '../network';
import { NETWORK_CONFIGS } from '../network';
import { unshieldedToken } from '../wallet';

export const CONTRACT_NAME = 'private-skill';
/** Must match the privateStateId used at deploy time so consumers reconnect. */
export const PRIVATE_STATE_ID = 'privateSkillPrivateState';
export const PRIVATE_STATE_STORE = 'private-skill-state';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function zkConfigPath(): string {
  return path.resolve(__dirname, '..', '..', 'contracts', 'managed', CONTRACT_NAME);
}

export async function loadCompiledContract(): Promise<{
  cfg: string;
  mod: Record<string, any>;
  compiledContract: any;
}> {
  const cfg = zkConfigPath();
  const contractPath = path.join(cfg, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    throw new Error('Contract not compiled! Run: npm run compile');
  }
  const mod = await import(pathToFileURL(contractPath).href);
  return { cfg, mod, compiledContract: buildCompiledContract(CONTRACT_NAME, mod.Contract, cfg) };
}

export function buildCompiledContract(contractName: string, Contract: any, cfg: string): any {
  return CompiledContract.make(contractName, Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(cfg),
  );
}

export interface ContractConnection {
  providers: any;
  deployed: any;
}

export async function createProviders(
  walletCtx: WalletContext,
  networkConfig: NetworkConfig,
  cfg: string = zkConfigPath(),
  privateStateStore: string = PRIVATE_STATE_STORE,
): Promise<any> {
  // The SDK requires the private-state password to be at least 16 characters.
  // The default below is a placeholder for local devnet only — set a strong
  // password via PRIVATE_STATE_PASSWORD when you move to a non-local target.
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    // In Midnight.js 4.1.x the WalletProvider interface returns the key objects
    // (CoinPublicKey / EncPublicKey) directly — no longer hex strings.
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(cfg);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: privateStateStore,
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

/** Deploy the PrivateSkill contract with the given constructor args. */
export async function deployPrivateSkill(
  providers: any,
  compiledContract: any,
  args: unknown[],
): Promise<Awaited<ReturnType<typeof deployContract>>> {
  return deployContract(providers, {
    compiledContract,
    args: args as never,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
}

/** Reconnect to an existing deployment. */
export async function findPrivateSkill(
  providers: any,
  compiledContract: any,
  contractAddress: string,
): Promise<Awaited<ReturnType<typeof findDeployedContract>>> {
  return findDeployedContract(providers, {
    compiledContract,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
}

/** Poll the proof-server until it answers (or give up after maxAttempts). */
export async function waitForProofServer(
  proofServerUrl: string,
  maxAttempts = 60,
  delayMs = 2000,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(proofServerUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
      return true;
    } catch (err: any) {
      const code = err?.cause?.code || err?.code || '';
      if (code !== 'ECONNREFUSED' && code !== 'UND_ERR_CONNECT_TIMEOUT' && code !== 'UND_ERR_SOCKET') {
        return true;
      }
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

/**
 * Register the wallet's NIGHT UTXOs for DUST generation and wait for a DUST
 * balance. Same logic as the scaffold's deploy flow — required on a fresh
 * devnet before any transaction can be balanced.
 */
export async function registerDustAndWait(walletCtx: WalletContext): Promise<void> {
  const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  const unregisteredUtxos = dustState.unshielded.availableCoins.filter(
    (c: any) => !c.meta?.registeredForDustGeneration,
  );
  if (unregisteredUtxos.length > 0) {
    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      walletCtx.unshieldedKeystore.getPublicKey(),
      (payload) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);
  }

  if (dustState.dust.balance(new Date()) === 0n) {
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
}

/**
 * Deploy the PrivateSkill contract with DUST-shortage retries. Sleeps ~1
 * block-time before attempt 1 (the wallet's DUST projection lags block
 * timestamps) and retries on transient dust-shortage errors.
 */
export async function deployWithDustRetries(
  providers: any,
  compiledContract: any,
  args: unknown[],
): Promise<Awaited<ReturnType<typeof deployContract>>> {
  const MAX_RETRIES = 20;
  const RETRY_DELAY_MS = 5000;

  await new Promise((r) => setTimeout(r, 6000));

  let lastError: any;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await deployPrivateSkill(providers, compiledContract, args);
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || err?.toString() || '';
      const errCause = err?.cause?.message || err?.cause?.toString() || '';
      const fullError = `${errMsg} ${errCause}`;
      const isDustShortage =
        fullError.includes('Not enough Dust') ||
        fullError.includes('Insufficient Funds') ||
        fullError.includes('could not balance dust');

      if (
        !isDustShortage &&
        (fullError.includes('Failed to connect to Proof Server') ||
          fullError.includes('connect ECONNREFUSED 127.0.0.1:6300'))
      ) {
        throw new Error('Proof server unreachable. Run: docker compose up -d');
      }

      if (isDustShortage && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/** Read the latest block timestamp (unix seconds) from the indexer. */
export async function queryBlockTime(indexerUrl: string): Promise<number> {
  const res = await fetch(indexerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ block { timestamp } }' }),
  });
  const json: any = await res.json();
  const ts = json?.data?.block?.timestamp;
  if (typeof ts !== 'number') {
    throw new Error('Unable to read block time from indexer');
  }
  return Math.floor(ts / 1000);
}

/** Resolve the network id from a --network flag, mirroring src/network.ts. */
export function parseNetworkFlagOrThrow(argv: string[]): NetworkId {
  const flagIdx = argv.indexOf('--network');
  const value = flagIdx >= 0 ? argv[flagIdx + 1] : undefined;
  const valid = (['undeployed', 'preview', 'preprod'] as const).filter((n) => n === value);
  if (value && valid.length === 0) {
    throw new Error(`Unknown network "${value}". Expected one of: undeployed, preview, preprod.`);
  }
  return valid[0] ?? 'undeployed';
}

/** NetworkConfig for a given network id (for non-interactive scripts). */
export function configFor(networkId: NetworkId): NetworkConfig {
  return NETWORK_CONFIGS[networkId];
}
