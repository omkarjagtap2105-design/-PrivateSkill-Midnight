import { useState, useCallback } from 'react'
import type { VerificationResultDetail } from '../hooks/useMidnight'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CircuitCallProps {
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
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
  lastResultDetail: VerificationResultDetail | null
  error?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getButtonLabel(isProving: boolean, proofStep: string | null): string {
  if (!isProving) return 'Verify Skill'
  if (proofStep?.toLowerCase().includes('submitting')) return 'Submitting…'
  if (proofStep?.toLowerCase().includes('proof')) return 'Generating Proof…'
  if (proofStep?.toLowerCase().includes('confirm')) return 'Confirming…'
  if (proofStep?.toLowerCase().includes('connect')) return 'Connecting…'
  if (proofStep?.toLowerCase().includes('loading')) return 'Loading…'
  return 'Generating Proof…'
}

function truncateTxHash(hash: string): string {
  if (hash.length <= 20) return hash
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CircuitCall({
  verifyThreshold,
  isProving,
  proofStep,
  lastResult,
  lastResultDetail,
  error: globalError,
}: CircuitCallProps) {
  const [credentialCommitment, setCredentialCommitment] = useState('')
  const [threshold, setThreshold] = useState<number>(70)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLocalError(null)

      if (!credentialCommitment.trim()) {
        setLocalError('Please enter a credential commitment.')
        return
      }
      if (!/^(0x)?[0-9a-fA-F]+$/.test(credentialCommitment.trim())) {
        setLocalError('Credential commitment must be a valid hex string (e.g. 0xd32cf38d…).')
        return
      }
      if (threshold < 0 || threshold > 65535) {
        setLocalError('Threshold must be between 0 and 65535.')
        return
      }

      try {
        await verifyThreshold(credentialCommitment.trim(), threshold)
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : String(err))
      }
    },
    [credentialCommitment, threshold, verifyThreshold],
  )

  const handleTryAgain = useCallback(() => { setLocalError(null) }, [])

  const buttonLabel = getButtonLabel(isProving, proofStep)
  const explorerBase = 'https://midnight-explorer.preprod.midnight.network/transaction'
  const activeError = localError || globalError

  return (
    <div className="circuit-call">

      {/* Privacy notice */}
      <div className="circuit-call__privacy-notice" role="note" aria-label="Privacy notice">
        🔒 Your exact score is <strong>never revealed</strong>. The ZK proof confirms only whether
        your score ≥ threshold. Private credential data is processed locally — never sent to any server.
      </div>

      {/* Verification form */}
      <form
        className="circuit-call__form"
        onSubmit={handleSubmit}
        aria-label="Verify skill threshold"
      >
        {/* Credential Commitment — PUBLIC input */}
        <div className="circuit-call__field">
          <label className="circuit-call__label" htmlFor="credentialCommitment">
            Credential Commitment
            <span className="circuit-call__label-hint">(public hex — identifies your credential on-chain)</span>
          </label>
          <input
            id="credentialCommitment"
            className="circuit-call__input"
            type="text"
            value={credentialCommitment}
            onChange={(e) => setCredentialCommitment(e.target.value)}
            placeholder="0xd32cf38d…  (32-byte hex commitment)"
            disabled={isProving}
            aria-required="true"
            aria-describedby="credentialCommitment-hint"
            spellCheck={false}
            autoComplete="off"
          />
          <span id="credentialCommitment-hint" className="circuit-call__field-hint">
            The public on-chain commitment that binds your credential. Not the score itself.
          </span>
        </div>

        {/* Threshold — PUBLIC input */}
        <div className="circuit-call__field">
          <label className="circuit-call__label" htmlFor="threshold">
            Score Threshold
            <span className="circuit-call__label-hint">(public — minimum required score)</span>
          </label>
          <input
            id="threshold"
            className="circuit-call__input circuit-call__input--number"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={0}
            max={65535}
            step={1}
            disabled={isProving}
            aria-required="true"
            aria-describedby="threshold-hint"
          />
          <span id="threshold-hint" className="circuit-call__field-hint">
            The verifier's minimum score. The ZK proof confirms score ≥ threshold
            <strong> without revealing the exact score.</strong>
          </span>
        </div>

        {/* Private inputs note */}
        <div className="circuit-call__private-note">
          🔐 <strong>Private inputs</strong> (score, certificate ID, holder identity, opening) are
          supplied by your Lace wallet's secure credential storage — they never appear in this form.
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="circuit-call__button"
          disabled={isProving}
          aria-busy={isProving}
        >
          {isProving && (
            <span className="circuit-call__spinner" role="presentation" aria-hidden="true" />
          )}
          {buttonLabel}
        </button>
      </form>

      {/* Proof progress */}
      {isProving && proofStep && (
        <div className="circuit-call__progress" role="status" aria-live="polite">
          <span className="circuit-call__spinner circuit-call__spinner--small" aria-hidden="true" />
          <span className="circuit-call__progress-text">{proofStep}</span>
        </div>
      )}

      {/* ── Result: PASSED ── */}
      {!isProving && lastResult === true && (
        <div
          className="circuit-call__result circuit-call__result--success"
          role="status"
          aria-live="polite"
        >
          <div className="circuit-call__result-header">
            ✅ Skill Verified — Threshold Met
          </div>
          {lastResultDetail && (
            <div className="circuit-call__result-meta">
              <span className="circuit-call__badge circuit-call__badge--real">
                ✓ Real Preprod Transaction
              </span>
              {lastResultDetail.txHash && (
                <div className="circuit-call__tx-info">
                  <span className="circuit-call__tx-label">Tx:</span>
                  <a
                    href={`${explorerBase}/${lastResultDetail.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="circuit-call__tx-link"
                    title={lastResultDetail.txHash}
                  >
                    {truncateTxHash(lastResultDetail.txHash)}
                  </a>
                </div>
              )}
              <div className="circuit-call__privacy-confirmed">
                🔒 Exact score was not revealed. Only the pass/fail result is on-chain.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Result: FAILED ── */}
      {!isProving && lastResult === false && (
        <div
          className="circuit-call__result circuit-call__result--failure"
          role="status"
          aria-live="polite"
        >
          <div className="circuit-call__result-header">
            ❌ Threshold Not Met
          </div>
          {lastResultDetail && (
            <div className="circuit-call__result-meta">
              <span className="circuit-call__badge circuit-call__badge--real">
                ✓ Real Preprod Transaction
              </span>
              {lastResultDetail.txHash && (
                <div className="circuit-call__tx-info">
                  <span className="circuit-call__tx-label">Tx:</span>
                  <a
                    href={`${explorerBase}/${lastResultDetail.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="circuit-call__tx-link"
                    title={lastResultDetail.txHash}
                  >
                    {truncateTxHash(lastResultDetail.txHash)}
                  </a>
                </div>
              )}
              <div className="circuit-call__privacy-confirmed">
                🔒 Exact score was not revealed.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error ── */}
      {activeError && (
        <div className="circuit-call__error" role="alert" aria-live="assertive">
          <span className="circuit-call__error-message">{activeError}</span>
          <button
            type="button"
            className="circuit-call__button circuit-call__button--retry"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default CircuitCall
