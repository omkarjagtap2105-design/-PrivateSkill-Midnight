/**
 * Contract-level test suite for PrivateSkill (Phase 3).
 *
 * Runs against a live Midnight network (local devnet by default). Deploys a
 * fresh PrivateSkill contract, then exercises every circuit with both positive
 * and negative scenarios and asserts the on-chain state afterwards.
 *
 *   npm run test:contracts [-- --network undeployed|preview|preprod]
 *
 * Exit code 0 when every scenario passes, 1 otherwise.
 */
import { WebSocket } from 'ws';

import { resolveNetwork, getOrCreateWallet, recordDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import {
  createProviders,
  deployWithDustRetries,
  findPrivateSkill,
  loadCompiledContract,
  queryBlockTime,
  registerDustAndWait,
  waitForProofServer,
} from '../src/private-skill/harness';
import { deriveActorKeys } from '../src/private-skill/actors';
import {
  holderIdFor,
  issuerIdFor,
  ownerIdFor,
  random32,
  requestIdFor,
  skillIdFor,
  toHex,
  typeIdFor,
  verifierIdFor,
  utf8,
  sha256,
} from '../src/private-skill/crypto';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);

// ─── Mini test harness ─────────────────────────────────────────────────────────

interface Result {
  name: string;
  pass: boolean;
  error?: string;
}
const results: Result[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`  ✅ ${name}`);
  } catch (error: any) {
    results.push({ name, pass: false, error: error?.message || String(error) });
    console.error(`  ❌ ${name}`);
    console.error(`     ${error?.message || error}`);
  }
}

/** Asserts that a contract call is REJECTED (assertion failure / invalid tx). */
async function expectRejected(fn: () => Promise<any>, detail: string): Promise<void> {
  try {
    await fn();
    throw new Error(`Transaction unexpectedly succeeded (${detail})`);
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('unexpectedly succeeded')) throw error;
    // expected rejection
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

// ─── Demo data (fixed, so the same commitment is reproducible) ─────────────────

const certIdA = sha256(utf8('cert-demo-001'));
const certIdB = sha256(utf8('cert-demo-002'));
const openingA = Uint8Array.from({ length: 32 }, (_, i) => (i + 7) % 256);
const openingB = Uint8Array.from({ length: 32 }, (_, i) => (i + 11) % 256);
const SCORE_A = 85n; // passes a 70 threshold
const SCORE_B = 50n; // fails a 70 threshold

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║          PrivateSkill — Contract Test Suite (' + network + ')        ');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const seed = WALLET.seed;

  console.log('─── Wallet ─────────────────────────────────────────────────────\n');
  const walletCtx = await createWallet({ network, networkConfig, seed });
  await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);

  await registerDustAndWait(walletCtx);
  console.log('  DUST ready.\n');

  console.log('─── Deploy ────────────────────────────────────────────────────\n');
  const proofServerReady = await waitForProofServer(networkConfig.proofServer);
  if (!proofServerReady) {
    console.error('  ❌ Proof server not responding. Run: docker compose up -d\n');
    process.exit(1);
  }
  console.log('  Proof server ready.');

  const { cfg, compiledContract, mod } = await loadCompiledContract();
  const providers = await createProviders(walletCtx, networkConfig, cfg);

  const actors = deriveActorKeys(seed);
  const ownerId = ownerIdFor(actors.ownerKey);
  const deploymentAddress = process.env.PRIVATE_SKILL_CONTRACT_ADDRESS?.trim();

  let deployed: Awaited<ReturnType<typeof findPrivateSkill>>;
  if (deploymentAddress) {
    console.log(`  Reusing deployed contract at ${deploymentAddress}`);
    deployed = await findPrivateSkill(providers, compiledContract, deploymentAddress);
  } else {
    const result = await deployWithDustRetries(providers, compiledContract, [ownerId]);
    deployed = result as any;
    const address = (result as any).deployTxData.public.contractAddress;
    console.log(`  ✅ Deployed at ${address}`);
    recordDeployment(network, address, walletCtx.unshieldedKeystore.getBech32Address().toString());
  }

  const contractAddress =
    deploymentAddress ?? (deployed as any).deployTxData.public.contractAddress;
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  if (deploymentAddress) recordDeployment(network, deploymentAddress, address);

  console.log(`  Contract address: ${contractAddress}\n`);

  async function ledgerState(): Promise<any> {
    const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
    if (!contractState) throw new Error('No contract state at ' + contractAddress);
    return mod.ledger(contractState.data);
  }

  // Chain clock — timestamps must be chosen relative to the block time that
  // blockTimeGte observes, not the host wall clock. Uint<64> args must be bigint.
  const now = await queryBlockTime(networkConfig.indexer);
  console.log(`  Chain block time (unix s): ${now}\n`);
  const tIssue = BigInt(now) - 120n;
  const tExpiry = BigInt(now) + 3600n;
  const tPast = BigInt(now) - 120n; // expired
  const tIssuePast = BigInt(now) - 7200n;

  const issuerId = issuerIdFor(actors.issuerKey);
  const holderId = holderIdFor(actors.holderKey);
  const verifierId = verifierIdFor(actors.verifierKey);
  const skillId = skillIdFor('blockchain');
  const typeId = typeIdFor('certificate');

  console.log('─── Scenarios ─────────────────────────────────────────────────\n');

  let commitmentA: Uint8Array | undefined;

  // 1. Constructor: owner sealed, registries empty.
  await test('1. Constructor sets sealed owner and empty registries', async () => {
    const l = await ledgerState();
    assert(toHex(l.owner) === toHex(ownerId), 'owner does not match derived owner id');
    assert(l.authorizedIssuers.isEmpty(), 'authorizedIssuers not empty');
    assert(l.credentials.isEmpty(), 'credentials not empty');
    assert(l.requests.isEmpty(), 'requests not empty');
  });

  // 2. Admin authorizes an issuer.
  await test('2. Owner registers an issuer', async () => {
    await deployed.callTx.registerIssuer(actors.ownerKey, actors.issuerKey);
    const l = await ledgerState();
    assert(l.authorizedIssuers.member(issuerId), 'issuer id not in authorizedIssuers');
  });

  // 3. Non-owner cannot register an issuer.
  await test('3. Non-owner cannot register an issuer', async () => {
    await expectRejected(
      () => deployed.callTx.registerIssuer(random32(), actors.issuerKey),
      'registerIssuer with a non-owner key',
    );
  });

  // 4. Authorized issuer issues a credential; only the commitment + public
  //    metadata land on-chain.
  await test('4. Authorized issuer issues a credential', async () => {
    const tx = await deployed.callTx.issueCredential(
      actors.issuerKey,
      certIdA,
      holderId,
      SCORE_A,
      openingA,
      skillId,
      typeId,
      tIssue,
      tExpiry,
    );
    const commitment = tx.private.result as Uint8Array;
    assert(commitment.length === 32, 'commitment is not 32 bytes');
    commitmentA = commitment;

    const l = await ledgerState();
    assert(l.credentials.member(commitment), 'commitment not on ledger');
    assert(l.credentialCount === 1n, 'credentialCount !== 1');
    const rec = l.credentials.lookup(commitment);
    assert(toHex(rec.skill) === toHex(skillId), 'skill mismatch');
    assert(toHex(rec.credentialType) === toHex(typeId), 'type mismatch');
    assert(toHex(rec.issuer) === toHex(issuerId), 'issuer mismatch');
    assert(rec.revoked === false, 'credential should not be revoked');
  });

  // 5. Unauthorized issuer cannot issue.
  await test('5. Unauthorized issuer cannot issue', async () => {
    await expectRejected(
      () =>
        deployed.callTx.issueCredential(
          random32(),
          certIdA,
          holderId,
          SCORE_A,
          openingA,
          skillId,
          typeId,
          tIssue,
          tExpiry,
        ),
      'issueCredential with an unauthorized issuer key',
    );
  });

  // 6. Duplicate issuance is rejected.
  await test('6. Duplicate issuance is rejected', async () => {
    await expectRejected(
      () =>
        deployed.callTx.issueCredential(
          actors.issuerKey,
          certIdA,
          holderId,
          SCORE_A,
          openingA,
          skillId,
          typeId,
          tIssue,
          tExpiry,
        ),
      'issuing the same credential twice',
    );
  });

  // 7. Cannot issue an already-expired credential.
  await test('7. Already-expired credential cannot be issued', async () => {
    await expectRejected(
      () =>
        deployed.callTx.issueCredential(
          actors.issuerKey,
          certIdA,
          holderId,
          SCORE_A,
          openingA,
          skillId,
          typeId,
          tIssuePast,
          tPast,
        ),
      'issuing a credential that is already expired',
    );
  });

  // 8. Verifier creates a verification request (pending).
  await test('8. Verifier creates a verification request', async () => {
    await deployed.callTx.createVerificationRequest(
      requestIdFor('req-pass'),
      verifierId,
      skillId,
      typeId,
      70n,
    );
    const l = await ledgerState();
    const req = l.requests.lookup(requestIdFor('req-pass'));
    assert(req.result.is_some === false, 'request should be pending');
    assert(req.threshold === 70n, 'threshold mismatch');
    assert(toHex(req.verifier) === toHex(verifierId), 'verifier mismatch');
    assert(l.requestCount === 1n, 'requestCount !== 1');
  });

  // 9. Holder answers with score >= threshold → PASS (score stays private).
  await test('9. Response with score >= threshold passes', async () => {
    const tx = await deployed.callTx.respondToVerification(
      requestIdFor('req-pass'),
      certIdA,
      holderId,
      SCORE_A,
      openingA,
    );
    assert(tx.private.result === true, 'expected PASS');
    const l = await ledgerState();
    const req = l.requests.lookup(requestIdFor('req-pass'));
    assert(req.result.is_some === true, 'request not answered');
    assert(req.result.value === true, 'expected some(true)');
  });

  // 10. A request can only be answered once.
  await test('10. Request cannot be answered twice', async () => {
    await expectRejected(
      () =>
        deployed.callTx.respondToVerification(
          requestIdFor('req-pass'),
          certIdA,
          holderId,
          SCORE_A,
          openingA,
        ),
      'answering an already-answered request',
    );
  });

  // 11. Score below threshold → FAIL (still a valid, recorded answer).
  await test('11. Response with score below threshold fails', async () => {
    await deployed.callTx.issueCredential(
      actors.issuerKey,
      certIdB,
      holderId,
      SCORE_B,
      openingB,
      skillId,
      typeId,
      tIssue,
      tExpiry,
    );
    await deployed.callTx.createVerificationRequest(
      requestIdFor('req-fail'),
      verifierId,
      skillId,
      typeId,
      70n,
    );
    const tx = await deployed.callTx.respondToVerification(
      requestIdFor('req-fail'),
      certIdB,
      holderId,
      SCORE_B,
      openingB,
    );
    assert(tx.private.result === false, 'expected FAIL');
    const l = await ledgerState();
    const req = l.requests.lookup(requestIdFor('req-fail'));
    assert(req.result.value === false, 'expected some(false)');
  });

  // 12. Standalone threshold proof.
  await test('12. verifySkillThreshold: pass at 70, fail at 90', async () => {
    // Issue a fresh credential dedicated to this test so the commitment is
    // known in-process (the exact score is folded into the commitment).
    const certIdC = sha256(utf8('cert-demo-003'));
    const openingC = random32();
    const txIssue = await deployed.callTx.issueCredential(
      actors.issuerKey,
      certIdC,
      holderId,
      85n,
      openingC,
      skillId,
      typeId,
      tIssue,
      tExpiry,
    );
    const commitmentC = txIssue.private.result as Uint8Array;

    const pass = await deployed.callTx.verifySkillThreshold(
      certIdC,
      holderId,
      85n,
      openingC,
      commitmentC,
      70n,
    );
    assert(pass.private.result === true, 'expected PASS at threshold 70');

    const fail = await deployed.callTx.verifySkillThreshold(
      certIdC,
      holderId,
      85n,
      openingC,
      commitmentC,
      90n,
    );
    assert(fail.private.result === false, 'expected FAIL at threshold 90');
  });

  // 13. Threshold proof against an unregistered commitment is rejected.
  await test('13. Threshold proof on unregistered commitment is rejected', async () => {
    const bogus = random32();
    await expectRejected(
      () =>
        deployed.callTx.verifySkillThreshold(
          certIdA,
          holderId,
          SCORE_A,
          openingA,
          bogus,
          70n,
        ),
      'verifySkillThreshold with an unregistered commitment',
    );
  });

  // 14. Revoked credential cannot verify.
  await test('14. Revoked credential cannot verify', async () => {
    assert(commitmentA !== undefined, 'cert A commitment missing');
    await deployed.callTx.revokeCredential(actors.issuerKey, commitmentA!);
    const l2 = await ledgerState();
    assert(l2.credentials.lookup(commitmentA!).revoked === true, 'credential not revoked');

    await deployed.callTx.createVerificationRequest(
      requestIdFor('req-revoked'),
      verifierId,
      skillId,
      typeId,
      70n,
    );
    await expectRejected(
      () =>
        deployed.callTx.respondToVerification(
          requestIdFor('req-revoked'),
          certIdA,
          holderId,
          SCORE_A,
          openingA,
        ),
      'verifying a revoked credential',
    );
  });

  // 15. Revoked issuer can no longer issue.
  await test('15. Revoked issuer can no longer issue', async () => {
    await deployed.callTx.revokeIssuer(actors.ownerKey, actors.issuerKey);
    const l = await ledgerState();
    assert(!l.authorizedIssuers.member(issuerId), 'issuer still authorized');
    await expectRejected(
      () =>
        deployed.callTx.issueCredential(
          actors.issuerKey,
          sha256(utf8('cert-demo-004')),
          holderId,
          85n,
          random32(),
          skillId,
          typeId,
          tIssue,
          tExpiry,
        ),
      'issuing after issuer revocation',
    );
  });

  // 16. Privacy: the public credential record carries no private attributes.
  await test('16. Privacy: ledger stores only commitments and public metadata', async () => {
    const l = await ledgerState();
    const privateKeys = ['score', 'certificateId', 'holderId', 'name', 'email'];
    for (const [commitment, rec] of l.credentials) {
      for (const key of privateKeys) {
        assert(!(key in rec), `credential record leaked "${key}"`);
      }
      assert(commitment.length === 32, 'credential key is not a 32-byte commitment');
      assert(rec.issuedAt !== undefined && rec.expiresAt !== undefined, 'public timestamps missing');
    }
  });

  // ─── Report ──────────────────────────────────────────────────────────────────

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log('\n─── Summary ──────────────────────────────────────────────────\n');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Contract: ${contractAddress}`);
  console.log(`  Network: ${network}\n`);
  console.log(failed === 0 ? '  🎉 All scenarios passed.\n' : '  ❌ Some scenarios failed.\n');

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
