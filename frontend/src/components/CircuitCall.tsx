import { useState, type FormEvent } from 'react'

interface CircuitCallProps {
  verifyThreshold: (credentialCommitment: string, threshold: number) => Promise<boolean | null>
  isProving: boolean
  proofStep: string | null
  lastResult: boolean | null
}

export function CircuitCall({ verifyThreshold, isProving, proofStep, lastResult }: CircuitCallProps) {
  const [credentialCommitment, setCredentialCommitment] = useState('')
  const [threshold, setThreshold] = useState<number>(70)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!credentialCommitment.trim()) {
      setFormError('Please enter a credential commitment.')
      return
    }
    if (threshold < 0 || threshold > 100) {
      setFormError('Threshold must be between 0 and 100.')
      return
    }

    await verifyThreshold(credentialCommitment.trim(), threshold)
  }

  function buttonLabel() {
    if (!isProving) return 'Verify Skill'
    if (proofStep?.includes('Generating')) return 'Generating Proof…'
    if (proofStep?.includes('Submitting')) return 'Submitting…'
    return 'Working…'
  }

  return (
    <section className="circuit-card" aria-label="Skill Verification">
      <h2 className="circuit-title">Verify a Skill Credential</h2>

      {/* Privacy notice — always visible */}
      <div className="privacy-notice" role="note">
        🔒 <strong>Your private credential data is processed locally by your wallet</strong> —
        it is never sent to any server or stored on-chain.
      </div>

      <form onSubmit={handleSubmit} className="circuit-form" noValidate>
        <div className="form-group">
          <label htmlFor="credential-commitment" className="form-label">
            Credential Commitment
            <span className="form-hint"> (hex — the on-chain public identifier of your credential)</span>
          </label>
          <input
            id="credential-commitment"
            type="text"
            className="form-input"
            placeholder="0x…"
            value={credentialCommitment}
            onChange={(e) => setCredentialCommitment(e.target.value)}
            disabled={isProving}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="form-group">
          <label htmlFor="threshold" className="form-label">
            Threshold (0–100)
            <span className="form-hint"> (minimum score required)</span>
          </label>
          <input
            id="threshold"
            type="number"
            className="form-input form-input--narrow"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={isProving}
          />
        </div>

        {/* NO score / certificateId / holderId / opening inputs — private data
            is supplied by the Lace wallet during proof generation */}

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--wide"
          disabled={isProving}
          aria-busy={isProving}
        >
          {buttonLabel()}
        </button>
      </form>

      {/* Proof progress */}
      {isProving && proofStep && (
        <div className="proof-progress" role="status" aria-live="polite">
          <span className="spinner spinner--inline" aria-hidden="true" />
          <span>{proofStep}</span>
        </div>
      )}

      {/* Result */}
      {!isProving && lastResult !== null && (
        <div
          className={`result-banner ${lastResult ? 'result-banner--success' : 'result-banner--fail'}`}
          role="status"
          aria-live="polite"
        >
          {lastResult ? (
            <>✅ <strong>Skill verified</strong> — threshold met</>
          ) : (
            <>❌ <strong>Threshold not met</strong></>
          )}
        </div>
      )}
    </section>
  )
}
