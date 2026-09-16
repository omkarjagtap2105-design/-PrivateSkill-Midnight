/** Debug: reproduce the StateValue error with a full stack trace. */
import { WebSocket } from 'ws';
import { resolveNetwork, getOrCreateWallet, getDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { createProviders, loadCompiledContract, findPrivateSkill } from '../src/private-skill/harness';
import { deriveActorKeys } from '../src/private-skill/actors';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);

const deployment = getDeployment(network);
if (!deployment) {
  console.error('No deployment on file — run npm run test:contracts first.');
  process.exit(1);
}

async function main() {
  const walletCtx = await createWallet({ network, networkConfig, seed: WALLET.seed });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  const { cfg, compiledContract } = await loadCompiledContract();
  const providers = await createProviders(walletCtx, networkConfig, cfg);
  const deployed: any = await findPrivateSkill(providers, compiledContract, deployment.address);
  console.log('Connected to', deployment.address);

  const actors = deriveActorKeys(WALLET.seed);

  try {
    const tx = await deployed.callTx.registerIssuer(actors.ownerKey, actors.issuerKey);
    console.log('registerIssuer OK:', tx.public.txId);
  } catch (e: any) {
    console.log('registerIssuer FAILED');
    console.log('--- message:', e?.message);
    console.log('--- cause:', e?.cause?.message);
    console.log('--- cause stack:');
    console.log(e?.cause?.stack || 'n/a');
  }

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
