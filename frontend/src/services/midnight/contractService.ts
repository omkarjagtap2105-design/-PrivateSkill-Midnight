/**
 * PrivateSkill Contract Service — Browser / Lace DApp Connector
 *
 * This module provides the REAL frontend→Midnight integration.
 *
 * Architecture:
 *   React UI
 *     └─ verifySkillThreshold(commitment, threshold)
 *          └─ contractService.ts           (this file)
 *               ├─ window.midnight.mnLace  (Lace DApp Connector)
 *               │    ├─ WalletProvider     (balanceTx, getCoinPublicKey, getEncryptionPublicKey)
 *               │    └─ MidnightProvider   (submitTx)
 *               ├─ FetchZkConfigProvider   (prover/verifier keys from /public/zk/)
 *               ├─ InMemoryPrivateStateProvider
 *               ├─ indexerPublicDataProvider (Preprod GraphQL indexer)
 *               ├─ httpClientProofProvider  (local proof server — provided by Lace or local)
 *               └─ findDeployedContract → callTx.verifySkillThreshold(...)
 *
 * PRIVACY MODEL:
 *   - credentialCommitment (hex)   → PUBLIC input to verifySkillThreshold
 *   - threshold (uint16)           → PUBLIC input
 *   - certificateId, holderId, score, opening  → PRIVATE witnesses (supplied by Lace wallet)
 *   - Result (boolean)             → disclosed on-chain; returned to React
 *   - Exact score                  → NEVER disclosed, NEVER leaves the proof
 *
 * NOTE: The verifySkillThreshold circuit takes private witnesses that the
 * credential holder's wallet supplies. In the browser DApp flow, these must
 * be supplied by the user (they know their own credential data). The UI collects
 * the credential commitment and threshold (public inputs only).
 *
 * For the ZK proof to work, the user also needs to supply their private
 * credential data (score, certificate ID, opening). The current UI collects
 * only the public inputs. In a full production flow, Lace would retrieve the
 * private credential from the wallet's secure storage. For the demo, the
 * holder enters the commitment (which implicitly identifies their credential).
 */

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import type { WalletProvider } from '@midnight-ntwrk/midnight-js-types'
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js'

import { FetchZkConfigProvider } from './FetchZkConfigProvider'
import { InMemoryPrivateStateProvider } from './InMemoryPrivateStateProvider'

// ── Constants ─────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS =
  'd32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2'

export const PRIVATE_STATE_ID = 'privateSkillPrivateState'

/** Midnight Preprod public indexer endpoints */
const PREPROD_INDEXER_HTTP = 'https://indexer.preprod.midnight.network/api/v4/graphql'
const PREPROD_INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws'

/**
 * The local proof server. Lace bundles an internal proof server accessible
 * at this address when the Midnight-enabled extension is active.
 * For local development, `docker compose up -d` exposes the proof server here.
 */
const PROOF_SERVER_URL = 'http://127.0.0.1:6300'

// ── Lace DApp Connector type declarations ────────────────────────────────────

/**
 * The Midnight Lace DApp Connector API as returned by mnLace.enable().
 *
 * Documented at: https://docs.midnight.network/develop/tutorial/dapp/api-overview
 *
 * The enabled API provides:
 *   - state()                  → address, coinPublicKey, encryptionPublicKey
 *   - balanceTransaction(tx)   → balanced + signed transaction
 *   - submitTransaction(tx)    → submitted transaction id
 *   - proveTransaction(...)    → internally proved transaction (if supported)
 */
interface MidnightLaceEnabledAPI {
  state(): Promise<{
    address?: string
    coinPublicKey?: string
    encryptionPublicKey?: string
  }>
  /**
   * Balance (and optionally sign) an unbound transaction.
   * Returns a FinalizedTransaction-compatible object.
   */
  balanceTransaction?(tx: unknown, ttl?: Date): Promise<unknown>
  /**
   * Submit a finalized transaction to the network.
   * Returns the transaction ID.
   */
  submitTransaction?(tx: unknown): Promise<string>
}

interface MidnightLaceAPI {
  enable(): Promise<MidnightLaceEnabledAPI>
  isEnabled(): Promise<boolean>
  name: string
  apiVersion: string
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceAPI
    }
  }
}

// ── hex ↔ Uint8Array helpers ──────────────────────────────────────────────────

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
    throw new Error(`Invalid hex string: "${hex}"`)
  }
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── Contract module loader ────────────────────────────────────────────────────

let _contractModuleCache: Record<string, unknown> | null = null

/**
 * Dynamically import the compiled private-skill contract module.
 *
 * The compiled JS is served from /contracts/managed/private-skill/contract/index.js
 * which Vite serves as a static asset. We import it once and cache it.
 *
 * NOTE: The managed/ directory is gitignored. In production (Vercel) the
 * compiled artifacts are NOT present. We handle this gracefully.
 */
async function loadContractModule(): Promise<Record<string, unknown> | null> {
  if (_contractModuleCache) return _contractModuleCache
  try {
    const mod = await import('../../contracts/private-skill/index.js')
    _contractModuleCache = mod as Record<string, unknown>
    return _contractModuleCache
  } catch (err) {
    console.error('Failed to load contract module:', err)
    return null
  }
}

// ── Provider construction ─────────────────────────────────────────────────────

interface BrowserProviders {
  privateStateProvider: InMemoryPrivateStateProvider
  publicDataProvider: ReturnType<typeof indexerPublicDataProvider>
  zkConfigProvider: FetchZkConfigProvider<string>
  proofProvider: ReturnType<typeof httpClientProofProvider>
  walletProvider: WalletProvider
  midnightProvider: { submitTx: (tx: unknown) => Promise<string> }
}

export interface LaceWalletInfo {
  address: string
  coinPublicKey: string
  encryptionPublicKey: string
  api: MidnightLaceEnabledAPI
}

/**
 * Connect to the Midnight Lace DApp Connector and retrieve wallet info.
 * Throws a descriptive error if Lace is not available or the user rejects.
 */
export async function connectLaceWallet(): Promise<LaceWalletInfo> {
  // Poll briefly for async injection (Lace injects the API asynchronously after page load)
  let mnLace = window.midnight?.mnLace ?? (window.midnight as any)?.lace ?? (window.cardano as any)?.mnLace ?? (window.cardano as any)?.lace
  if (!mnLace) {
    for (let i = 0; i < 15; i++) {
      await sleep(150)
      mnLace = window.midnight?.mnLace ?? (window.midnight as any)?.lace ?? (window.cardano as any)?.mnLace ?? (window.cardano as any)?.lace
      if (mnLace) break
    }
  }

  if (!mnLace) {
    throw new Error(
      'Midnight Lace wallet extension not found. Please install the Midnight-enabled Lace extension from https://docs.midnight.network or https://www.lace.io and ensure it is enabled for this site.',
    )
  }

  const api = await mnLace.enable()
  let state: { address?: string; coinPublicKey?: string; encryptionPublicKey?: string } = {}
  if (typeof api.state === 'function') {
    try {
      state = (await api.state()) || {}
    } catch {
      state = {}
    }
  }

  let address = state.address ?? state.coinPublicKey ?? null
  if (!address && typeof (api as any).getUsedAddresses === 'function') {
    try {
      const used = await (api as any).getUsedAddresses()
      if (used?.length) address = used[0]
    } catch { /* */ }
  }
  if (!address && typeof (api as any).getChangeAddress === 'function') {
    try {
      address = await (api as any).getChangeAddress()
    } catch { /* */ }
  }

  if (!address) {
    throw new Error('Connected Lace wallet returned no address. Make sure your Midnight wallet is unlocked in Lace.')
  }

  const coinPublicKey = state.coinPublicKey ?? ''
  const encryptionPublicKey = state.encryptionPublicKey ?? ''

  return { address, coinPublicKey, encryptionPublicKey, api }
}

/**
 * Build browser-compatible MidnightProviders using the Lace DApp Connector API.
 *
 * The WalletProvider interface requires:
 *   - getCoinPublicKey()           → CoinPublicKey
 *   - getEncryptionPublicKey()     → EncPublicKey
 *   - balanceTx(tx, ttl?)          → FinalizedTransaction
 *
 * The MidnightProvider interface requires:
 *   - submitTx(tx)                 → TransactionId
 */
async function buildProviders(laceInfo: LaceWalletInfo): Promise<BrowserProviders> {
  setNetworkId('preprod')

  const zkConfigProvider = new FetchZkConfigProvider<string>('/zk')
  const privateStateProvider = new InMemoryPrivateStateProvider()
  const publicDataProvider = indexerPublicDataProvider(PREPROD_INDEXER_HTTP, PREPROD_INDEXER_WS)
  const proofProvider = httpClientProofProvider(PROOF_SERVER_URL, zkConfigProvider)

  // Build WalletProvider from Lace DApp Connector
  // The DApp Connector's balanceTransaction/submitTransaction methods are the
  // browser-side equivalents of the Node.js wallet's balanceTx/submitTx.
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => {
      // CoinPublicKey is a branded type — cast through unknown
      return hexToBytes(laceInfo.coinPublicKey) as unknown as ReturnType<WalletProvider['getCoinPublicKey']>
    },
    getEncryptionPublicKey: () => {
      return hexToBytes(laceInfo.encryptionPublicKey) as unknown as ReturnType<WalletProvider['getEncryptionPublicKey']>
    },
    balanceTx: async (tx: unknown, ttl?: Date) => {
      if (!laceInfo.api.balanceTransaction) {
        throw new Error(
          'The connected Lace wallet does not support balanceTransaction. ' +
          'Please ensure you are using a Midnight-compatible version of Lace.',
        )
      }
      return laceInfo.api.balanceTransaction(tx, ttl) as ReturnType<WalletProvider['balanceTx']>
    },
  }

  const midnightProvider = {
    submitTx: async (tx: unknown): Promise<string> => {
      if (!laceInfo.api.submitTransaction) {
        throw new Error(
          'The connected Lace wallet does not support submitTransaction. ' +
          'Please ensure you are using a Midnight-compatible version of Lace.',
        )
      }
      return laceInfo.api.submitTransaction(tx) as Promise<string>
    },
  }

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  }
}

// ── Main verification entry point ─────────────────────────────────────────────

export interface VerificationResult {
  passed: boolean
  txHash: string | null
  contractAddress: string
  network: 'preprod'
}

export type VerificationStep =
  | 'connecting-wallet'
  | 'loading-contract'
  | 'preparing-proof-inputs'
  | 'generating-zk-proof'
  | 'submitting-transaction'
  | 'waiting-for-confirmation'
  | 'complete'

/**
 * Execute the real verifySkillThreshold circuit call against the Preprod contract.
 *
 * This function:
 *  1. Connects to Midnight Lace DApp Connector
 *  2. Loads the compiled private-skill contract module
 *  3. Builds browser-compatible providers (ZK config, proof server, indexer)
 *  4. Calls findDeployedContract to bind to the existing Preprod deployment
 *  5. Invokes callTx.verifySkillThreshold with the user's credential data
 *  6. Returns the real boolean result and transaction hash
 *
 * @param credentialCommitmentHex - The hex-encoded on-chain commitment (public input)
 * @param threshold - The minimum score threshold (public input)
 * @param privateInputs - The holder's private credential data (ZK witnesses — NEVER disclosed)
 * @param onStep - Callback to report UI step transitions
 */
export async function executeVerifySkillThreshold(
  credentialCommitmentHex: string,
  threshold: number,
  privateInputs: {
    certificateId: Uint8Array
    holderId: Uint8Array
    score: bigint
    opening: Uint8Array
  },
  onStep: (step: VerificationStep) => void,
): Promise<VerificationResult> {

  // Step 1: Connect to Lace
  onStep('connecting-wallet')
  const laceInfo = await connectLaceWallet()

  // Step 2: Load the compiled contract module
  onStep('loading-contract')
  const mod = await loadContractModule()
  if (!mod) {
    throw new Error(
      'Contract artifacts not found. The compiled private-skill contract ' +
      '(contracts/managed/private-skill/contract/index.js) must be served by the frontend. ' +
      'Run `npm run compile` to generate them, then copy to frontend/public/contracts/private-skill/.',
    )
  }

  const Contract = mod.Contract as unknown as new (...args: unknown[]) => unknown

  // Build the CompiledContract using the SDK's pipe API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const compiledContract = (CompiledContract as any).make('private-skill', Contract).pipe(
    (CompiledContract as any).withVacantWitnesses,
    (CompiledContract as any).withCompiledFileAssets('/zk'),
  )

  // Step 3: Build providers
  onStep('preparing-proof-inputs')
  const providers = await buildProviders(laceInfo)

  // Convert hex commitment to bytes
  const credentialCommitment = hexToBytes(credentialCommitmentHex)

  // Step 4: Connect to the deployed contract
  const deployed = await findDeployedContract(providers as any, {
    compiledContract: compiledContract as any,
    contractAddress: CONTRACT_ADDRESS,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  })

  // Step 5: Generate ZK proof
  onStep('generating-zk-proof')

  // Step 6: Submit transaction
  onStep('submitting-transaction')

  // Call the verifySkillThreshold circuit
  // Circuit signature (from private-skill.compact):
  //   circuit verifySkillThreshold(
  //     certificateId: Bytes<32>,    // private
  //     holderId: Bytes<32>,         // private
  //     score: Uint<16>,             // private — NEVER disclosed
  //     opening: Bytes<32>,          // private
  //     credentialCommitment: Bytes<32>, // public
  //     threshold: Uint<16>,         // public
  //   ): Boolean
  onStep('waiting-for-confirmation')

  const txResult = await deployed.callTx.verifySkillThreshold(
    privateInputs.certificateId,
    privateInputs.holderId,
    privateInputs.score,
    privateInputs.opening,
    credentialCommitment,
    BigInt(threshold),
  )

  onStep('complete')

  // The result is the boolean returned by the circuit: score >= threshold
  // txResult.private.result is the JS-typed circuit return value
  const passed: boolean = (txResult as any).private?.result === true

  // Extract transaction hash from finalized tx data
  const txHash: string | null = (txResult as any).public?.txId
    ?? (txResult as any).public?.transactionHash
    ?? null

  return {
    passed,
    txHash,
    contractAddress: CONTRACT_ADDRESS,
    network: 'preprod',
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Query the current verification result for a request from the public ledger.
 * This is a read-only query — no transaction needed.
 */
export async function queryContractState(contractAddress: string = CONTRACT_ADDRESS): Promise<{
  credentialCount: bigint
  requestCount: bigint
  isReachable: boolean
}> {
  try {
    setNetworkId('preprod')
    const publicDataProvider = indexerPublicDataProvider(PREPROD_INDEXER_HTTP, PREPROD_INDEXER_WS)
    const state = await publicDataProvider.queryContractState(contractAddress)
    if (!state) {
      return { credentialCount: 0n, requestCount: 0n, isReachable: false }
    }
    // The ledger module is needed to decode state.data — requires the compiled contract
    return { credentialCount: 0n, requestCount: 0n, isReachable: true }
  } catch {
    return { credentialCount: 0n, requestCount: 0n, isReachable: false }
  }
}
