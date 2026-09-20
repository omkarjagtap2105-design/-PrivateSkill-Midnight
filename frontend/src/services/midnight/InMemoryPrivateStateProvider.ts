/**
 * Browser-compatible in-memory PrivateStateProvider.
 *
 * levelPrivateStateProvider uses LevelDB (Node.js only). This implementation
 * stores private state in a plain Map, which is fine for a single browser session —
 * the private state only needs to persist for the duration of the circuit call.
 *
 * SECURITY: Private state (ZK witnesses) lives in JS memory only.
 * It is never written to localStorage, sessionStorage, or any external service.
 */

import type { PrivateStateProvider, PrivateStateId } from '@midnight-ntwrk/midnight-js-types'
import type { ContractAddress, SigningKey } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime'
import type {
  ExportPrivateStatesOptions,
  ImportPrivateStatesOptions,
  ImportPrivateStatesResult,
  PrivateStateExport,
  SigningKeyExport,
  ExportSigningKeysOptions,
  ImportSigningKeysOptions,
  ImportSigningKeysResult,
} from '@midnight-ntwrk/midnight-js-types'

export class InMemoryPrivateStateProvider<
  PSI extends PrivateStateId = PrivateStateId,
  PS = unknown,
> implements PrivateStateProvider<PSI, PS>
{
  private readonly states = new Map<string, PS>()
  private readonly signingKeys = new Map<string, SigningKey>()
  private contractAddress: ContractAddress | null = null

  setContractAddress(address: ContractAddress): void {
    this.contractAddress = address
  }

  private scopedKey(id: PSI): string {
    return `${this.contractAddress ?? 'unscoped'}:${id}`
  }

  async set(privateStateId: PSI, state: PS): Promise<void> {
    this.states.set(this.scopedKey(privateStateId), state)
  }

  async get(privateStateId: PSI): Promise<PS | null> {
    return this.states.get(this.scopedKey(privateStateId)) ?? null
  }

  async remove(privateStateId: PSI): Promise<void> {
    this.states.delete(this.scopedKey(privateStateId))
  }

  async clear(): Promise<void> {
    this.states.clear()
  }

  async setSigningKey(address: ContractAddress, signingKey: SigningKey): Promise<void> {
    this.signingKeys.set(address as string, signingKey)
  }

  async getSigningKey(address: ContractAddress): Promise<SigningKey | null> {
    return this.signingKeys.get(address as string) ?? null
  }

  async removeSigningKey(address: ContractAddress): Promise<void> {
    this.signingKeys.delete(address as string)
  }

  async clearSigningKeys(): Promise<void> {
    this.signingKeys.clear()
  }

  // ── Export / import stubs — not needed for browser session use ───────────
  async exportPrivateStates(_options?: ExportPrivateStatesOptions): Promise<PrivateStateExport> {
    throw new Error('exportPrivateStates is not supported in InMemoryPrivateStateProvider')
  }

  async importPrivateStates(
    _exportData: PrivateStateExport,
    _options?: ImportPrivateStatesOptions,
  ): Promise<ImportPrivateStatesResult> {
    throw new Error('importPrivateStates is not supported in InMemoryPrivateStateProvider')
  }

  async exportSigningKeys(_options?: ExportSigningKeysOptions): Promise<SigningKeyExport> {
    throw new Error('exportSigningKeys is not supported in InMemoryPrivateStateProvider')
  }

  async importSigningKeys(
    _exportData: SigningKeyExport,
    _options?: ImportSigningKeysOptions,
  ): Promise<ImportSigningKeysResult> {
    throw new Error('importSigningKeys is not supported in InMemoryPrivateStateProvider')
  }
}
