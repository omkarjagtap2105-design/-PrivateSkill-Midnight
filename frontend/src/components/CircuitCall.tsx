import { useState, useCallback } from 'react'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CircuitCallProps {
  verifyThreshold: (credentialCommitment: string, threshold: number) => Promise<boolean | null>
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive the submit button label from the current proof step. */
function getButtonLabel(isProving: boolean, proofStep: string | null): string {
  if (!isProving) return 'Verify Skill'
  if (proofStep && proofStep.toLowerCase().includes('submitting')) return 'Submitting...'
  if (proofStep && proofStep.toLowerCase().includes('generating')) return 'Generating Proof...'
  if (proofStep && proofStep.toLowerCase().includes('proof')) return 'Generating Proof...'
  if (proofStep && proofStep.toLowerCase().includes('transaction')) return 'Submitting...'
  return 'Generating Proof...'
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CircuitCall renders the form to call verifySkillThreshold on the
 * private-skill contract.
 *
 * Only PUBLIC inputs are collected here:
 *   - credentialCommitment (hex string)
 *   - threshold (number, 0–100)
 *
 * Private inputs (score, certificateId, holderId, opening) are NEVER
 * collected, stored, or rendered — they are supplied by the Lace wallet
 * internally during proof generation.
 *
 * Requirements: 5, 9
 */
export function CircuitCall({
  verifyThreshold,
  isProving,
  proofStep,
  lastResult,
}: CircuitCallProps) {
  // ── Local form state ───────────────────────────────────────────────────────
  const [credentialCommitment, setCredentialCommitment] = useState('')
  const [threshold, setThreshold] = useState<number>(50)
  const [localError, setLocalError] = useState<string | null>(null)

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLocalError(null)

      // Basic client-side validation
      if (!credentialCommitment.trim()) {
        setLocalError('Please enter a credential commitment.')
        return
      }
      if (!/^(0x)?[0-9a-fA-F]+$/.test(credentialCommitment.trim())) {
        setLocalError('Credential commitment must be a valid hex string.')
        return
      }
      if (threshold < 0 || threshold > 100) {
        setLocalError('Threshold must be between 0 and 100.')
        return
      }

      try {
        await verifyThreshold(credentialCommitment.trim(), threshold)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setLocalError(msg)
      }
    },
    [credentialCommitment, threshold, verifyThreshold],
  )

  const handleTryAgain = useCallback(() => {
    setLocalError(null)
  }, [])

  const buttonLabel = getButtonLabel(isProving, proofStep)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="circuit-call">
      {/* Privacy notice — always visible */}
      <div className="circuit-call__privacy-notice" role="note" aria-label="Privacy notice">
        🔒 Your private credential data is processed locally by your wallet — it is never sent to
        any server
      </div>

      {/* Verification form */}
      <form
        className="circuit-call__form"
        onSubmit={handleSubmit}
        aria-label="Verify skill threshold"
      >
        {/* Credential Commitment input */}
        <div className="circuit-call__field">
          <label className="circuit-call__label" htmlFor="credentialCommitment">
            Credential Commitment
            <span className="circuit-call__label-hint">(hex string)</span>
          </label>
          <input
            id="credentialCommitment"
            className="circuit-call__input"
            type="text"
            value={credentialCommitment}
            onChange={(e) => setCredentialCommitment(e.target.value)}
            placeholder="0x1a2b3c4d…"
            disabled={isProving}
            aria-required="true"
            aria-describedby="credentialCommitment-hint"
            spellCheck={false}
            autoComplete="off"
          />
          <span id="credentialCommitment-hint" className="circuit-call__field-hint">
            The public on-chain commitment to your credential. Not the score itself.
          </span>
        </div>

        {/* Threshold input */}
        <div className="circuit-call__field">
          <label className="circuit-call__label" htmlFor="threshold">
            Threshold
            <span className="circuit-call__label-hint">(0 – 100)</span>
          </label>
          <input
            id="threshold"
            className="circuit-call__input circuit-call__input--number"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={0}
            max={100}
            step={1}
            disabled={isProving}
            aria-required="true"
            aria-describedby="threshold-hint"
          />
          <span id="threshold-hint" className="circuit-call__field-hint">
            Minimum skill score to verify. The proof will confirm your score meets or exceeds this
            value without revealing your exact score.
          </span>
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
          <span className="circuit-call__progress-text">{proofStep}</span>
        </div>
      )}

      {/* Result display */}
      {!isProving && lastResult === true && (
        <div
          className="circuit-call__result circuit-call__result--success"
          role="status"
          aria-live="polite"
        >
          ✅ Skill verified — threshold met
        </div>
      )}

      {!isProving && lastResult === false && (
        <div
          className="circuit-call__result circuit-call__result--failure"
          role="status"
          aria-live="polite"
        >
          ❌ Threshold not met
        </div>
      )}

      {/* Error display */}
      {localError && (
        <div
          className="circuit-call__error"
          role="alert"
          aria-live="assertive"
        >
          <span className="circuit-call__error-message">{localError}</span>
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
