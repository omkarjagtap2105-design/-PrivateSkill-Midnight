/**
 * Browser-compatible ZkConfigProvider that fetches ZK artifacts via HTTP.
 *
 * NodeZkConfigProvider reads from the filesystem (Node.js only).
 * This implementation fetches the same binary artifacts from the frontend's
 * /public/zk/ directory, making it usable in the browser.
 *
 * Expected file layout (served from the Vite dev server or Vercel):
 *   /zk/keys/<circuitId>.prover    — prover key binary
 *   /zk/keys/<circuitId>.verifier  — verifier key binary
 *   /zk/zkir/<circuitId>.zkir      — ZK intermediate representation
 */

import { ZKConfigProvider } from '@midnight-ntwrk/midnight-js-types'
import type { ProverKey, VerifierKey, ZKIR } from '@midnight-ntwrk/midnight-js-types'

// ── Type-brand helpers (mirror @midnight-ntwrk/midnight-js-types internals) ──
function asProverKey(bytes: Uint8Array): ProverKey {
  return bytes as ProverKey
}
function asVerifierKey(bytes: Uint8Array): VerifierKey {
  return bytes as VerifierKey
}
function asZKIR(bytes: Uint8Array): ZKIR {
  return bytes as ZKIR
}

async function fetchBinary(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ZK artifact at ${url}: HTTP ${response.status} ${response.statusText}`
    )
  }
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * A ZKConfigProvider that loads prover keys, verifier keys, and ZKIRs
 * from URLs relative to a given base URL (defaults to the current origin).
 *
 * File naming convention matches NodeZkConfigProvider:
 *   keys/<circuitId>.prover
 *   keys/<circuitId>.verifier
 *   zkir/<circuitId>.zkir
 */
export class FetchZkConfigProvider<K extends string> extends ZKConfigProvider<K> {
  private readonly baseUrl: string

  constructor(baseUrl: string = '/zk') {
    super()
    // Normalize: strip trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async getProverKey(circuitId: K): Promise<ProverKey> {
    const bytes = await fetchBinary(`${this.baseUrl}/keys/${circuitId}.prover`)
    return asProverKey(bytes)
  }

  async getVerifierKey(circuitId: K): Promise<VerifierKey> {
    const bytes = await fetchBinary(`${this.baseUrl}/keys/${circuitId}.verifier`)
    return asVerifierKey(bytes)
  }

  async getZKIR(circuitId: K): Promise<ZKIR> {
    const bytes = await fetchBinary(`${this.baseUrl}/zkir/${circuitId}.zkir`)
    return asZKIR(bytes)
  }
}
