/**
 * Deterministic actors for PrivateSkill.
 *
 * Every actor's secret key is derived from the same wallet seed via
 * SHA-256 domain separation. This keeps the demo/test harness reproducible
 * (same seed → same actors) without persisting any secrets to disk beyond the
 * seed the wallet already manages.
 *
 * Secrets derived here (issuerKey, holderKey, verifierKey, opening) are
 * privacy-sensitive: they must never be logged, stored on-chain, or returned
 * by an API. They are only ever used as ZK witnesses inside contract circuits.
 */
import { sha256, utf8 } from './crypto';

export interface ActorKeys {
  /** Owner / admin secret key — governs registerIssuer / revokeIssuer. */
  ownerKey: Uint8Array;
  /** Issuer secret key — e.g. "Midnight Academy". */
  issuerKey: Uint8Array;
  /** Student / holder secret key — e.g. "Omkar Jagtap". */
  holderKey: Uint8Array;
  /** Verifier secret key — e.g. "Tech Company". */
  verifierKey: Uint8Array;
}

/** Derive the four actor secret keys from a wallet seed (hex string). */
export function deriveActorKeys(baseSeed: string): ActorKeys {
  const root = sha256(utf8('privateskill:actors:v1'), utf8(baseSeed));
  return {
    ownerKey: sha256(root, utf8('owner')),
    issuerKey: sha256(root, utf8('issuer')),
    holderKey: sha256(root, utf8('holder')),
    verifierKey: sha256(root, utf8('verifier')),
  };
}

/** Demo-world display names (demo mode only; never used as contract input). */
export const DEMO_ROLES = {
  owner: { name: 'PrivateSkill Admin', role: 'owner' },
  issuer: { name: 'Midnight Academy', role: 'issuer' },
  holder: { name: 'Omkar Jagtap', role: 'student' },
  verifier: { name: 'Tech Company', role: 'verifier' },
} as const;

export interface DemoCredential {
  /** Public metadata stored on-chain by issueCredential. */
  skillId: Uint8Array;
  credentialTypeId: Uint8Array;
  issuedAt: bigint;
  expiresAt: bigint;
  /** The score — the secret. It is only ever used as a ZK witness. */
  score: bigint;
}

export const DEMO_CREDENTIAL: DemoCredential = {
  skillId: new Uint8Array(32),
  credentialTypeId: new Uint8Array(32),
  issuedAt: 1_700_000_000n,
  expiresAt: 1_800_000_000n,
  score: 85n,
};
