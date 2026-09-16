/**
 * Off-chain cryptography helpers for PrivateSkill.
 *
 * These mirror the Compact-standard-library operations used inside
 * `contracts/private-skill.compact` so that TypeScript can compute the exact
 * same domain-separated identities, skill ids, and (optionally) commitment
 * openings that the contract does.
 *
 *   * `pad(n, str)`  ⇄ Compact's `pad(n, "...")` builtin (right-padded bytes).
 *   * `hashIdentity` ⇄ `persistentHash<Vector<2, Bytes<32>>>([domain, value])`.
 *
 * Only NON-sensitive values (public identities, skill ids, credential ids)
 * are computed here. The exact score and the commitment opening are secrets
 * and never leave the acting party's context.
 */
import { Buffer } from 'node:buffer';
import { createHash, randomBytes } from 'node:crypto';
import {
  CompactTypeBytes,
  CompactTypeVector,
  persistentHash,
} from '@midnight-ntwrk/compact-runtime';

/** `pad(n, str)` ⇄ Compact's `pad` builtin: UTF-8 bytes, zero-padded on the right. */
export function pad(n: number, str: string): Uint8Array {
  const raw = Buffer.from(str, 'utf-8');
  if (raw.length > n) {
    throw new Error(`pad(${n}, "${str}"): string is ${raw.length} bytes, which exceeds ${n}`);
  }
  const out = new Uint8Array(n);
  out.set(raw);
  return out;
}

const BYTES_32 = new CompactTypeBytes(32);
const VECTOR_2_X_32 = new CompactTypeVector(2, BYTES_32);

/** Domain-separated persistent hash ⇄ `persistentHash<Vector<2, Bytes<32>>>`. */
export function hashIdentity(domain: Uint8Array, value: Uint8Array): Uint8Array {
  return persistentHash(VECTOR_2_X_32, [domain, value]);
}

/** Simple deterministic SHA-256 — used only to derive actor keys, never on-chain. */
export function sha256(...parts: Array<Uint8Array | string>): Uint8Array {
  const h = createHash('sha256');
  for (const p of parts) h.update(p);
  return new Uint8Array(h.digest());
}

/** Cryptographically secure random 32 bytes — used for commitment openings. */
export function random32(): Uint8Array {
  return new Uint8Array(randomBytes(32));
}

/** UTF-8 bytes of a string. */
export function utf8(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'utf-8'));
}

/** ASCII-safe hex representation (for logs / ids). */
export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

/** Hex string → Uint8Array (inverse of toHex). */
export function fromHex(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

/**
 * Domain separators — MUST match the ones hard-coded in private-skill.compact
 * (`pad(32, "privateskill:<role>:v1")`).
 */
export const DOMAINS = {
  owner: pad(32, 'privateskill:owner:v1'),
  issuer: pad(32, 'privateskill:issuer:v1'),
  holder: pad(32, 'privateskill:holder:v1'),
  skill: pad(32, 'privateskill:skill:v1'),
  credentialType: pad(32, 'privateskill:type:v1'),
  request: pad(32, 'privateskill:request:v1'),
  verifier: pad(32, 'privateskill:verifier:v1'),
} as const;

/** Public identity of an actor given their secret key and role domain. */
export function identityFor(domain: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return hashIdentity(domain, secretKey);
}

/** Public skill id for a skill name, e.g. skillIdFor("blockchain"). */
export function skillIdFor(skillName: string): Uint8Array {
  return hashIdentity(DOMAINS.skill, pad(32, skillName.toLowerCase()));
}

/** Public credential-type id, e.g. typeIdFor("certificate"). */
export function typeIdFor(typeName: string): Uint8Array {
  return hashIdentity(DOMAINS.credentialType, pad(32, typeName.toLowerCase()));
}

/** Public owner id for the admin secret key (constructor argument). */
export function ownerIdFor(ownerKey: Uint8Array): Uint8Array {
  return identityFor(DOMAINS.owner, ownerKey);
}

/** Public issuer id for an issuer secret key. */
export function issuerIdFor(issuerKey: Uint8Array): Uint8Array {
  return identityFor(DOMAINS.issuer, issuerKey);
}

/** Public holder id for a holder secret key. */
export function holderIdFor(holderKey: Uint8Array): Uint8Array {
  return identityFor(DOMAINS.holder, holderKey);
}

/** Public verifier id for a verifier secret key. */
export function verifierIdFor(verifierKey: Uint8Array): Uint8Array {
  return identityFor(DOMAINS.verifier, verifierKey);
}

/** Public verification-request id for a request label (must be unique). */
export function requestIdFor(label: string): Uint8Array {
  return hashIdentity(DOMAINS.request, pad(32, label));
}
