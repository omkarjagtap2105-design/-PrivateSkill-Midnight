import { useState, useCallback } from 'react'

// ─── Lace Wallet API type declarations ───────────────────────────────────────
// These mirror the @midnight-ntwrk/dapp-connector-api shape exposed by Lace.

interface MidnightLaceWalletState {
  address?: string
  coinPublicKey?: string
}

interface MidnightLaceAPI {
  enable: () => Promise<MidnightLaceEnabledAPI>
  isEnabled: () => Promise<boolean>
  name: string
  icon: string
  apiVersion: string
}

interface MidnightLaceEnabledAPI {
  state: () => Promise<MidnightLaceWalletState>
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceAPI
    }
  }
}

// ─── Hook state types ─────────────────────────────────────────────────────────

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface UseMidnightReturn {
  connectionState: ConnectionState
  walletAddress: string | null
  error: string | null
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
  connect: () => Promise<void>
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

  // ── connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setError(null)
    setConnectionState('connecting')

    // Wait up to 1 second for the Midnight dapp connector to inject.
    // Some browsers/extensions inject window.midnight.mnLace asynchronously
    // after page load. This polling loop catches late injections.
    let lace = window.midnight?.mnLace
    if (!lace) {
      for (let i = 0; i < 10; i++) {
        await sleep(100)
        lace = window.midnight?.mnLace
        if (lace) break
      }
    }

    if (!lace) {
      setError(
        'Midnight dapp connector not found. ' +
        'Make sure you are using the Midnight-enabled Lace build ' +
        '(install from https://docs.midnight.network) and that the ' +
        'extension is enabled on this page.'
      )
      setConnectionState('error')
      return
    }

    try {
      const api = await lace.enable()
      const state = await api.state()

      const address = state.address ?? state.coinPublicKey ?? null
      if (!address) {
        throw new Error('Could not retrieve wallet address. Make sure Lace is on the Midnight network.')
      }

      setWalletAddress(address)
      setConnectionState('connected')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('cancelled')) {
        setError('Connection rejected. Please approve the connection request in Lace.')
      } else if (
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('chain') ||
        msg.toLowerCase().includes('midnight')
      ) {
        setError('Wrong network. Please switch Lace to the Midnight network and try again.')
      } else {
        setError(`Connection failed: ${msg}`)
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
  }, [])

  // ── verifyThreshold ────────────────────────────────────────────────────────
  // Accepts ONLY public inputs (credentialCommitment, threshold).
  // The private inputs (score, certificateId, holderId, opening) are
  // supplied by the Lace wallet during proof generation — they NEVER
  // pass through this function or appear in the UI state.

  const verifyThreshold = useCallback(
    async (credentialCommitment: string, threshold: number): Promise<boolean | null> => {
      const lace = window.midnight?.mnLace
      if (!lace) {
        setError('Midnight dapp connector not found. Please connect your Lace wallet first.')
        return null
      }

      setError(null)
      setLastResult(null)
      setIsProving(true)

      try {
        // Step 1: Prepare proof inputs
        setProofStep('Preparing proof inputs…')
        await sleep(300)

        // Step 2: Generate ZK proof (handled by Lace wallet internally)
        setProofStep('Generating zero-knowledge proof… (this may take a moment)')
        await sleep(500)

        // Step 3: Submit transaction
        setProofStep('Submitting transaction to Midnight Network…')
        await sleep(300)

        // NOTE: In production this calls the deployed contract via the
        // Midnight.js SDK. For the current build (no contract deployed yet)
        // we simulate a pending result so the UI flow is demonstrable.
        // Replace this block with the actual SDK call once the contract
        // address is available and the Midnight.js packages are integrated.
        //
        // Example production call:
        //   const result = await midnightContract.verifySkillThreshold(
        //     credentialCommitment,
        //     threshold,
        //   )
        //   setLastResult(result)

        // Placeholder result for demonstration
        const simulatedResult = credentialCommitment.length > 0 && threshold >= 0

        setProofStep('Complete')
        setLastResult(simulatedResult)
        return simulatedResult
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)

        if (msg.toLowerCase().includes('proof')) {
          setError(`Proof generation failed: ${msg}`)
        } else if (msg.toLowerCase().includes('transaction') || msg.toLowerCase().includes('tx')) {
          setError(`Transaction failed: ${msg}`)
        } else {
          setError(`Verification failed: ${msg}`)
        }

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
    connect,
    disconnect,
    verifyThreshold,
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
