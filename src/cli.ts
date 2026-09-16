/**
 * Interactive CLI for the PrivateSkill contract.
 *
 * The demo runs on a single local-devnet wallet that plays every role. Each
 * role is a *domain-separated identity* derived from the wallet seed — the
 * secret key for each role exists only in memory and is used purely as a ZK
 * witness. On the ledger you can see only:
 *   • commitments (opaque 32-byte values) for credentials,
 *   • public skill / type ids and timestamps,
 *   • the boolean outcome of verification requests.
 * Never the score, certificate contents, or the holder's name.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { WebSocket } from 'ws';

import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { createProviders, loadCompiledContract, findPrivateSkill } from './private-skill/harness';
import { deriveActorKeys } from './private-skill/actors';
import {
  fromHex,
  holderIdFor,
  issuerIdFor,
  ownerIdFor,
  requestIdFor,
  skillIdFor,
  toHex,
  typeIdFor,
  verifierIdFor,
} from './private-skill/crypto';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;
{
  const notice = formatWalletBackupNotice(WALLET, network);
  if (notice) console.log(notice);
}

// ─── Main CLI ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     PrivateSkill CLI                            ');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });

  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run deploy -- --network ${network}\` first.`);
    process.exit(1);
  }
  const deploymentAddress = deployment.address;
  console.log(`  Contract: ${deploymentAddress}`);
  console.log(`  Network: ${network}\n`);

  const actors = deriveActorKeys(SEED);
  const ids = {
    owner: toHex(ownerIdFor(actors.ownerKey)),
    issuer: toHex(issuerIdFor(actors.issuerKey)),
    holder: toHex(holderIdFor(actors.holderKey)),
    verifier: toHex(verifierIdFor(actors.verifierKey)),
  };
  console.log('  Demo actors (public ids, derived from the wallet seed):');
  console.log(`    Owner:    0x${ids.owner}`);
  console.log(`    Issuer:   0x${ids.issuer}`);
  console.log(`    Holder:   0x${ids.holder}`);
  console.log(`    Verifier: 0x${ids.verifier}\n`);

  // State shared by the helper closures.
  let walletCtx!: WalletContext;
  let providers: Awaited<ReturnType<typeof createProviders>>;
  let ledgerModule: Record<string, any>;
  let deployed: any;

  const issuedCommitments: Uint8Array[] = [];

  async function connect() {
    console.log('  Connecting to wallet...');
    walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    console.log('  Syncing with network...');
    await walletCtx.wallet.waitForSyncedState();
    await persistWalletState(network, walletCtx);
    const { cfg, mod, compiledContract } = await loadCompiledContract();
    ledgerModule = mod;
    console.log('  Setting up providers...');
    providers = await createProviders(walletCtx, networkConfig, cfg);
    console.log('  Connecting to contract...');
    deployed = await findPrivateSkill(providers, compiledContract, deploymentAddress);
    console.log('  ✅ Connected!\n');
  }

  async function readLedger(): Promise<any | null> {
    if (!providers) return null;
    const contractState = await providers.publicDataProvider.queryContractState(deploymentAddress);
    if (!contractState) return null;
    return ledgerModule.ledger(contractState.data);
  }

  async function runTx(fn: () => Promise<void>) {
    console.log('  Submitting transaction (this may take 30-60 seconds)...');
    try {
      await fn();
    } catch (error) {
      console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error);
    }
  }

  function printLedger(l: any) {
    console.log('\n─── Ledger state ──────────────────────────────────────────────');
    console.log(`  Owner:            0x${toHex(l.owner)}`);
    const issuers = [...l.authorizedIssuers].map(toHex);
    console.log(`  Issuers:          ${issuers.length ? issuers.map((h) => `0x${h.slice(0, 16)}…`).join(', ') : '(none)'}`);
    console.log(`  Credentials:      ${l.credentials.size()} (count: ${l.credentialCount})`);
    for (const [commitment, rec] of l.credentials) {
      console.log(`    • 0x${toHex(commitment).slice(0, 16)}… skill=0x${toHex(rec.skill).slice(0, 16)}… type=0x${toHex(rec.credentialType).slice(0, 16)}… revoked=${rec.revoked}`);
    }
    console.log(`  Requests:         ${l.requests.size()} (count: ${l.requestCount})`);
    for (const [requestId, req] of l.requests) {
      console.log(`    • 0x${toHex(requestId).slice(0, 16)}… threshold=${req.threshold} result=${req.result.is_some ? (req.result.value ? 'PASS' : 'FAIL') : 'pending'}`);
    }
    console.log('─────────────────────────────────────────────────────────────────\n');
  }

  await connect();

  const ledger = await readLedger();
  if (ledger) printLedger(ledger);

  let running = true;
  while (running) {
    console.log('─── Menu ───────────────────────────────────────────────────────');
    console.log('  1. Register issuer (owner)');
    console.log('  2. Revoke issuer (owner)');
    console.log('  3. Issue credential (issuer)');
    console.log('  4. Revoke credential (issuer)');
    console.log('  5. Create verification request (verifier)');
    console.log('  6. Respond to verification (holder)');
    console.log('  7. Verify skill threshold (verifier, standalone)');
    console.log('  8. Read ledger state');
    console.log('  9. Check wallet balance');
    console.log('  0. Exit\n');

    const choice = await rl.question('  Your choice: ');

    switch (choice.trim()) {
      case '1': {
        console.log('  Registering issuer Midnight Academy...');
        await runTx(async () => {
          await deployed.callTx.registerIssuer(actors.ownerKey, actors.issuerKey);
          console.log('  ✅ Issuer registered.');
        });
        break;
      }
      case '2': {
        console.log('  Revoking issuer Midnight Academy...');
        await runTx(async () => {
          await deployed.callTx.revokeIssuer(actors.ownerKey, actors.issuerKey);
          console.log('  ✅ Issuer revoked.');
        });
        break;
      }
      case '3': {
        const skill = await rl.question('  Skill name (default "blockchain"): ');
        const name = skill.trim() || 'blockchain';
        const opening = Uint8Array.from({ length: 32 }, (_, i) => (i + 7) % 256);
        console.log(`  Issuing credential (skill="${name}", score=85)...`);
        await runTx(async () => {
          const tx = await deployed.callTx.issueCredential(
            actors.issuerKey,
            Uint8Array.from([1, 2, 3]), // demo certificate id
            holderIdFor(actors.holderKey),
            85n,
            opening,
            skillIdFor(name),
            typeIdFor('certificate'),
            1_700_000_000n,
            1_800_000_000n,
          );
          const commitment = tx.private.result;
          issuedCommitments.push(commitment);
          console.log(`  ✅ Credential issued. Commitment: 0x${toHex(commitment)}`);
        });
        break;
      }
      case '4': {
        const commitment = await rl.question('  Credential commitment (hex): ');
        console.log('  Revoking credential...');
        await runTx(async () => {
          await deployed.callTx.revokeCredential(actors.issuerKey, fromHex(commitment.trim()));
          console.log('  ✅ Credential revoked.');
        });
        break;
      }
      case '5': {
        const label = await rl.question('  Request label (unique, default "job-app-1"): ');
        const threshold = await rl.question('  Score threshold (default 70): ');
        const lbl = label.trim() || 'job-app-1';
        const th = threshold.trim() ? BigInt(threshold.trim()) : 70n;
        console.log(`  Creating verification request "${lbl}" (threshold=${th})...`);
        await runTx(async () => {
          await deployed.callTx.createVerificationRequest(
            requestIdFor(lbl),
            verifierIdFor(actors.verifierKey),
            skillIdFor('blockchain'),
            typeIdFor('certificate'),
            th,
          );
          console.log('  ✅ Request created.');
        });
        break;
      }
      case '6': {
        const label = await rl.question('  Request label (default "job-app-1"): ');
        const lbl = label.trim() || 'job-app-1';
        console.log('  Responding as holder with score=85 (score stays private)...');
        await runTx(async () => {
          const tx = await deployed.callTx.respondToVerification(
            requestIdFor(lbl),
            Uint8Array.from([1, 2, 3]),
            holderIdFor(actors.holderKey),
            85n,
            Uint8Array.from({ length: 32 }, (_, i) => (i + 7) % 256),
          );
          console.log(`  ✅ Verification result: ${tx.private.result ? 'PASS' : 'FAIL'}`);
        });
        break;
      }
      case '7': {
        const threshold = await rl.question('  Score threshold (default 70): ');
        const th = threshold.trim() ? BigInt(threshold.trim()) : 70n;
        const commitment =
          issuedCommitments[issuedCommitments.length - 1] ?? Uint8Array.from([1, 2, 3]);
        console.log(`  Verifying score >= ${th} against commitment 0x${toHex(commitment).slice(0, 16)}…`);
        await runTx(async () => {
          const tx = await deployed.callTx.verifySkillThreshold(
            Uint8Array.from([1, 2, 3]),
            holderIdFor(actors.holderKey),
            85n,
            Uint8Array.from({ length: 32 }, (_, i) => (i + 7) % 256),
            commitment,
            th,
          );
          console.log(`  ✅ Threshold check: ${tx.private.result ? 'PASS' : 'FAIL'}`);
        });
        break;
      }
      case '8': {
        const ledgerState = await readLedger();
        if (ledgerState) printLedger(ledgerState);
        else console.log('\n  📋 Contract state is empty or unreachable.\n');
        break;
      }
      case '9': {
        console.log('\n  Checking balance...');
        const currentState = await walletCtx.wallet.waitForSyncedState();
        const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
        const dustBalance = currentState.dust.balance(new Date());
        console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
        console.log(`  DUST: ${dustBalance.toLocaleString()}\n`);
        break;
      }
      case '0':
        running = false;
        console.log('\n  👋 Goodbye!\n');
        break;
      default:
        console.log('\n  ❌ Invalid choice.\n');
    }
  }

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  rl.close();
}

main().catch(console.error);
