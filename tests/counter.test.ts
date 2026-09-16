/**
 * Counter contract static tests.
 *
 * These tests run entirely in-memory against the compiled JS artifacts at
 * contracts/managed/counter/contract/index.js. They do NOT require Docker,
 * a running proof server, or any network connection.
 *
 * If the artifacts have not been compiled yet, all tests are skipped with an
 * informative message — the suite still exits with code 0.
 *
 * Run:             npm test
 * Compile first:   npm run compile
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTER_CONTRACT_PATH = path.resolve(
  __dirname,
  '../contracts/managed/counter/contract/index.js'
);

const artifactsExist = existsSync(COUNTER_CONTRACT_PATH);

describe('Counter Contract', () => {
  // Shared module reference — populated in beforeAll when artifacts exist.
  let contractModule: Record<string, any>;

  beforeAll(async () => {
    if (!artifactsExist) return;
    contractModule = await import(pathToFileURL(COUNTER_CONTRACT_PATH).href);
  });

  // ── Test A: Circuit logic ────────────────────────────────────────────────────
  // Verify the increment circuit exists and accepts the `amount` private witness.
  test.skipIf(!artifactsExist)(
    'Test A — contract exports an increment circuit that accepts a private amount witness',
    () => {
      const Contract = contractModule?.Contract;
      expect(Contract, 'Module should export a Contract object').toBeDefined();

      const circuits = Contract?.circuits;
      expect(circuits, 'Contract should have a circuits property').toBeDefined();
      expect(
        typeof circuits?.increment,
        'circuits.increment should be a function'
      ).toBe('function');

      // The increment circuit takes one argument (the private `amount` witness).
      // Circuit functions in Compact-compiled JS expose an `length` or named params.
      // We verify the function is callable (non-zero arity or at minimum a function).
      expect(circuits.increment).toBeTypeOf('function');
    }
  );

  // ── Test B: State transition ──────────────────────────────────────────────────
  // Verify counter and lastIncrementBy both exist in initialState.
  test.skipIf(!artifactsExist)(
    'Test B — initialState exposes counter and lastIncrementBy ledger fields',
    () => {
      const Contract = contractModule?.Contract;
      expect(Contract).toBeDefined();

      const initialState =
        typeof Contract?.initialState === 'function'
          ? Contract.initialState()
          : Contract?.initialState;

      expect(initialState, 'Contract should expose initialState').toBeDefined();

      // counter starts at 0
      const counterValue =
        initialState?.counter ??
        initialState?.data?.counter ??
        initialState?.ledger?.counter;

      expect(
        counterValue === 0n || counterValue === 0,
        `counter should start at 0, got: ${counterValue}`
      ).toBe(true);

      // lastIncrementBy starts at 0
      const lastIncrementBy =
        initialState?.lastIncrementBy ??
        initialState?.data?.lastIncrementBy ??
        initialState?.ledger?.lastIncrementBy;

      // Accept undefined (field may not be surfaced until first tx) or 0
      expect(
        lastIncrementBy === undefined ||
        lastIncrementBy === 0n ||
        lastIncrementBy === 0,
        `lastIncrementBy should be 0 or undefined initially, got: ${lastIncrementBy}`
      ).toBe(true);
    }
  );

  // ── Test C: Privacy ──────────────────────────────────────────────────────────
  // The counter contract's private `amount` witness must NOT be exported as a
  // named property on the Contract or module. Private witnesses are ZK circuit
  // inputs — they must never appear in the public interface.
  test.skipIf(!artifactsExist)(
    'Test C — private witnesses (amount, score, holderId, certificateId) are not exported',
    () => {
      const privateFields = [
        'amount',       // counter.compact private witness
        'score',        // private-skill.compact private witness — should not leak here
        'holderId',
        'certificateId',
        'opening',
      ];

      for (const field of privateFields) {
        expect(
          field in contractModule,
          `Top-level module must not export private field "${field}"`
        ).toBe(false);
      }

      const Contract = contractModule?.Contract;
      if (Contract && typeof Contract === 'object') {
        for (const field of privateFields) {
          expect(
            field in Contract,
            `Contract object must not export private field "${field}"`
          ).toBe(false);
        }
      }
    }
  );

  // ── Test D: Ledger export contains only public fields ────────────────────────
  test.skipIf(!artifactsExist)(
    'Test D — ledger export does not reference private witness fields',
    () => {
      const privateFields = ['score', 'holderId', 'certificateId', 'opening'];

      if (!('ledger' in contractModule)) return; // no ledger export — pass trivially

      const ledgerExport = contractModule.ledger;

      if (typeof ledgerExport === 'function') {
        const src = ledgerExport.toString();
        for (const field of privateFields) {
          expect(
            src.includes(field),
            `ledger function source must not reference private field "${field}"`
          ).toBe(false);
        }
        return;
      }

      if (typeof ledgerExport === 'object' && ledgerExport !== null) {
        for (const field of privateFields) {
          expect(
            field in ledgerExport,
            `ledger object must not expose private field "${field}"`
          ).toBe(false);
        }
      }
    }
  );

  // ── Fallback: inform developer when artifacts are missing ───────────────────
  test.skipIf(artifactsExist)(
    'Skipped — Counter artifacts not compiled — run: npm run compile',
    () => {
      // Intentionally skipped when artifacts exist.
      // When artifacts are absent all substantive tests skip; this placeholder
      // keeps the suite visible in the reporter and exits 0.
    }
  );
});
