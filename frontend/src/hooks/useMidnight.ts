import { useState, useCallback } from 'react'

// ─── Wallet API type declarations ─────────────────────────────────────────────

// Standard Lace (Cardano) — window.cardano.lace
interface CardanoLaceAPI {
  enable: () => Promise<CardanoLaceEnabledAPI>
  isEnabled: () => Promise<boolean>
  name: string
  icon: string
  apiVersion: string
}

interface CardanoLaceEnabledAPI {
  getUsedAddresses: () => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  getChangeAddress: () => Promise<string>
  getRewardAddresses: () => Promise<string[]>
}

// Midnight Lace — window.midnight.mnLace
interface MidnightLaceAPI {
  enable: () => Promise<MidnightLaceEnabledAPI>
  isEnabled: () => Promise<boolean>
  name: string
  icon: string
  apiVersion: string
}

interface MidnightLaceEnabledAPI {
  state: () => Promise<{ address?: string; coinPublicKey?: string }>
}

declare global {
  interface Window {
    cardano?: {
      lace?: CardanoLaceAPI
      [key: string]: unknown
    }
    midnight?: {
      mnLace?: MidnightLaceAPI
    }
  }
}

// ─── Hook state types ─────────────────────────────────────────────────────────

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'
export type WalletType = 'lace-cardano' | 'lace-midnight' | 'demo' | null

export interface UseMidnightReturn {
  connectionState: ConnectionState
  walletAddress: string | null
  error: string | null
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
  isDemoMode: boolean
  walletType: WalletType
  isLaceInstalled: boolean
  isMidnightLaceInstalled: boolean
  connect: () => Promise<void>
  connectDemo: () => void
  disconnect: () => void
  verifyThreshold: (credentialCommitment: string, threshold: number) => Promise<boolean | null>
}

// ─── Hook implementation ──────────────────────────────────────────────────────

export function useMidnight(): UseMidnightReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProving, setIsProving] = useState(false)
  const [proofStep, setProofStep] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [walletType, setWalletType] = useState<WalletType>(null)

  // Detect which wallet APIs are available
  const isLaceInstalled = typeof window !== 'undefined' && !!window.cardano?.lace
  const isMidnightLaceInstalled = typeof window !== 'undefined' && !!window.midnight?.mnLace

  // ── connect ────────────────────────────────────────────────────────────────
  // Tries Midnight Lace first, falls back to standard Lace (Cardano)

  const connect = useCallback(async () => {
    setError(null)
    setConnectionState('connecting')

    // Poll briefly for async injection
    let midnightLace = window.midnight?.mnLace
    let cardanoLace = window.cardano?.lace

    if (!midnightLace && !cardanoLace) {
      for (let i = 0; i < 10; i++) {
        await sleep(100)
        midnightLace = window.midnight?.mnLace
        cardanoLace = window.cardano?.lace
        if (midnightLace || cardanoLace) break
      }
    }

    // ── Try Midnight Lace first ──────────────────────────────────────────
    if (midnightLace) {
      try {
        const api = await midnightLace.enable()
        const state = await api.state()
        const address = state.address ?? state.coinPublicKey ?? null
        if (!address) throw new Error('No address returned from Midnight Lace.')
        setWalletAddress(address)
        setWalletType('lace-midnight')
        setConnectionState('connected')
        return
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('cancel')) {
          setError('Connection rejected. Please approve the request in Lace.')
          setConnectionState('error')
          return
        }
        // Fall through to try standard Lace
      }
    }

    // ── Try standard Lace (Cardano) ──────────────────────────────────────
    if (cardanoLace) {
      try {
        const api = await cardanoLace.enable()

        // Try to get a usable address
        let address: string | null = null
        try {
          const used = await api.getUsedAddresses()
          if (used && used.length > 0) address = used[0]
        } catch { /* ignore */ }

        if (!address) {
          try {
            const unused = await api.getUnusedAddresses()
            if (unused && unused.length > 0) address = unused[0]
          } catch { /* ignore */ }
        }

        if (!address) {
          try {
            address = await api.getChangeAddress()
          } catch { /* ignore */ }
        }

        if (!address) {
          throw new Error('Could not retrieve wallet address from Lace.')
        }

        // Truncate long hex addresses for display
        const displayAddress = address.length > 20
          ? address.slice(0, 12) + '…' + address.slice(-6)
          : address

        setWalletAddress(displayAddress)
        setWalletType('lace-cardano')
        setConnectionState('connected')
        return
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('cancel')) {
          setError('Connection rejected. Please approve the request in Lace.')
        } else {
          setError(`Lace connection failed: ${msg}`)
        }
        setConnectionState('error')
        return
      }
    }

    // ── Neither wallet found ─────────────────────────────────────────────
    setError(
      'Lace wallet not found. Install Lace from https://www.lace.io and refresh the page.'
    )
    setConnectionState('error')
  }, [])

  // ── disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setConnectionState('disconnected')
    setWalletAddress(null)
    setError(null)
    setIsProving(false)
    setProofStep(null)
    setLastResult(null)
    setIsDemoMode(false)
    setWalletType(null)
  }, [])

  // ── connectDemo ────────────────────────────────────────────────────────────

  const connectDemo = useCallback(() => {
    setError(null)
    setConnectionState('connecting')
    setTimeout(() => {
      setIsDemoMode(true)
      setWalletType('demo')
      setWalletAddress('demo1midnight…abc456')
      setConnectionState('connected')
    }, 800)
  }, [])

  // ── verifyThreshold ────────────────────────────────────────────────────────

  const verifyThreshold = useCallback(
    async (credentialCommitment: string, threshold: number): Promise<boolean | null> => {
      setError(null)
      setLastResult(null)
      setIsProving(true)

      try {
        setProofStep('Preparing proof inputs…')
        await sleep(400)

        setProofStep('Generating zero-knowledge proof… (this may take a moment)')
        await sleep(1200)

        setProofStep('Submitting transaction to Midnight Network…')
        await sleep(600)

        // Simulated result — replace with real SDK call once contract is deployed:
        // const result = await midnightContract.verifySkillThreshold(credentialCommitment, threshold)
        const simulatedResult = credentialCommitment.length > 0 && threshold >= 0

        setProofStep('Complete')
        setLastResult(simulatedResult)
        return simulatedResult
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Verification failed: ${msg}`)
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
    isDemoMode,
    walletType,
    isLaceInstalled,
    isMidnightLaceInstalled,
    connect,
    connectDemo,
    disconnect,
    verifyThreshold,
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
