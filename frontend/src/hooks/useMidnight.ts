/**
 * useMidnight — Real Lace wallet connection + PrivateSkill contract interaction.
 *
 * REAL FLOW (Midnight Lace connected):
 *   1. connectLaceWallet() — Lace DApp Connector API
 *   2. findDeployedContract → Preprod contract (d32cf38d…)
 *   3. callTx.verifySkillThreshold(...) — ZK proof + transaction
 *   4. Boolean result on-chain; returned to React
 *
 * PRIVACY:
 *   - credentialCommitment, threshold → public inputs (collected in UI)
 *   - certificateId, holderId, score, opening → private witnesses (processed locally)
 *   - The exact score is never revealed — only the boolean result is disclosed
 */

import { useState, useCallback } from 'react'
import {
  connectLaceWallet,
  executeVerifySkillThreshold,
  type VerificationStep,
} from '../services/midnight/contractService'

// ─── Wallet API type declarations ─────────────────────────────────────────────

interface CardanoLaceAPI {
  enable: () => Promise<unknown>
  isEnabled: () => Promise<boolean>
  name: string
}

declare global {
  interface Window {
    cardano?: { lace?: CardanoLaceAPI; [key: string]: unknown }
  }
}

// ─── Hook types ───────────────────────────────────────────────────────────────

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'
export type WalletType = 'lace-midnight' | 'lace-cardano' | null

export interface VerificationResultDetail {
  passed: boolean
  txHash: string | null
  contractAddress: string
  network: string
  isReal: boolean
}

export interface UseMidnightReturn {
  connectionState: ConnectionState
  walletAddress: string | null
  error: string | null
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
  lastResultDetail: VerificationResultDetail | null
  walletType: WalletType
  isLaceInstalled: boolean
  connect: () => Promise<void>
  disconnect: () => void
  verifyThreshold: (
    credentialCommitment: string,
    threshold: number,
    privateInputs?: {
      certificateId?: string
      holderId?: string
      score?: number
      opening?: string
    }
  ) => Promise<boolean | null>
}

// ─── Step label map ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<VerificationStep, string> = {
  'connecting-wallet':         'Connecting to Lace wallet…',
  'loading-contract':          'Loading contract artifacts…',
  'preparing-proof-inputs':    'Preparing verification…',
  'generating-zk-proof':       'Generating proof…',
  'submitting-transaction':    'Submitting transaction…',
  'waiting-for-confirmation':  'Waiting for confirmation…',
  'complete':                  'Complete',
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMidnight(): UseMidnightReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProving, setIsProving] = useState(false)
  const [proofStep, setProofStep] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [lastResultDetail, setLastResultDetail] = useState<VerificationResultDetail | null>(null)
  const [walletType, setWalletType] = useState<WalletType>(null)

  const isLaceInstalled =
    typeof window !== 'undefined' &&
    (!!window.midnight?.mnLace ||
      !!(window.midnight as unknown as { lace?: unknown })?.lace ||
      !!(window.cardano as unknown as { mnLace?: unknown })?.mnLace ||
      !!window.cardano?.lace)

  // ── connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setError(null)
    setConnectionState('connecting')

    try {
      const laceInfo = await connectLaceWallet()
      const addressDisplay =
        laceInfo.address.length > 20
          ? `${laceInfo.address.slice(0, 10)}…${laceInfo.address.slice(-6)}`
          : laceInfo.address

      setWalletAddress(addressDisplay)
      setWalletType('lace-midnight')
      setConnectionState('connected')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isUserRejected =
        msg.toLowerCase().includes('user rejected') ||
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('refused')
      const isChannelClosed =
        msg.toLowerCase().includes('shutdown') ||
        msg.toLowerCase().includes('channel') ||
        msg.toLowerCase().includes('no longer be used')

      if (isUserRejected) {
        setError('Connection rejected. Please approve the request in your Lace wallet.')
      } else if (isChannelClosed) {
        setError('Lace extension disconnected. Please click the Lace icon in your browser toolbar to unlock/wake it, then click Try Again.')
      } else {
        setError(msg)
      }
      setConnectionState('error')
    }
  }, [])

  // ── disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setConnectionState('disconnected')
    setWalletAddress(null)
    setError(null)
    setIsProving(false)
    setProofStep(null)
    setLastResult(null)
    setLastResultDetail(null)
    setWalletType(null)
  }, [])

  // ── verifyThreshold ────────────────────────────────────────────────────────

  const verifyThreshold = useCallback(
    async (
      credentialCommitment: string,
      threshold: number,
      privateInputs?: {
        certificateId?: string
        holderId?: string
        score?: number
        opening?: string
      },
    ): Promise<boolean | null> => {
      setError(null)
      setLastResult(null)
      setLastResultDetail(null)
      setIsProving(true)

      try {
        const certIdHex = privateInputs?.certificateId ?? '00'.repeat(32)
        const holderIdHex = privateInputs?.holderId ?? '00'.repeat(32)
        const scoreValue = privateInputs?.score !== undefined ? BigInt(privateInputs.score) : 85n
        const openingHex = privateInputs?.opening ?? '00'.repeat(32)

        const zkPrivateInputs = {
          certificateId: hexToBytes(certIdHex),
          holderId: hexToBytes(holderIdHex),
          score: scoreValue,
          opening: hexToBytes(openingHex),
        }

        const result = await executeVerifySkillThreshold(
          credentialCommitment,
          threshold,
          zkPrivateInputs,
          (step) => {
            setProofStep(STEP_LABELS[step])
          },
        )

        setLastResult(result.passed)
        setLastResultDetail({
          passed: result.passed,
          txHash: result.txHash,
          contractAddress: result.contractAddress,
          network: result.network,
          isReal: true,
        })
        return result.passed

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        const isChannelClosed =
          msg.toLowerCase().includes('shutdown') ||
          msg.toLowerCase().includes('channel') ||
          msg.toLowerCase().includes('no longer be used')

        setError(
          isChannelClosed
            ? 'Lace extension connection closed by browser. Please click the Lace extension icon in your browser toolbar to unlock/wake it, then try again.'
            : `Verification failed: ${msg}`,
        )
        return null
      } finally {
        setIsProving(false)
        setProofStep(null)
      }
    },
    [],
  )

  return {
    connectionState,
    walletAddress,
    error,
    isProving,
    proofStep,
    lastResult,
    lastResultDetail,
    walletType,
    isLaceInstalled,
    connect,
    disconnect,
    verifyThreshold,
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (clean.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${hex}`)
  }
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return bytes
}
