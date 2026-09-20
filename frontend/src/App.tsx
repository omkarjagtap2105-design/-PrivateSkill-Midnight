import { WalletConnect } from './components/WalletConnect'
import { CircuitCall } from './components/CircuitCall'
import { useMidnight } from './hooks/useMidnight'
import './App.css'

export default function App() {
  const {
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
  } = useMidnight()

  const isConnected = connectionState === 'connected'

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-brand">
            <span className="app-brand__icon" aria-hidden="true">🌑</span>
            <div>
              <h1 className="app-brand__name">PrivateSkill</h1>
              <p className="app-brand__tagline">Prove your skills. Keep your score private.</p>
            </div>
          </div>

          <WalletConnect
            connectionState={connectionState}
            walletAddress={walletAddress}
            error={error}
            walletType={walletType}
            isLaceInstalled={isLaceInstalled}
            connect={connect}
            disconnect={disconnect}
          />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="app-main">
        {isConnected ? (
          <CircuitCall
            verifyThreshold={verifyThreshold}
            isProving={isProving}
            proofStep={proofStep}
            lastResult={lastResult}
            lastResultDetail={lastResultDetail}
            error={error}
          />
        ) : (
          <div className="welcome-card">
            <h2 className="welcome-card__title">Welcome to PrivateSkill</h2>
            <p className="welcome-card__body">
              Verify skill credentials using zero-knowledge proofs on the{' '}
              <strong>Midnight Network</strong> — your score is never revealed.
            </p>

            <ul className="privacy-list">
              <li>✅ Your exact score is <strong>never revealed</strong></li>
              <li>✅ Proof is generated <strong>locally in your wallet</strong></li>
              <li>✅ Only a boolean result is stored on-chain</li>
            </ul>

            <div className="welcome-actions">
              {isLaceInstalled ? (
                <button
                  type="button"
                  className="welcome-btn welcome-btn--primary"
                  onClick={connect}
                >
                  🟣 Connect Lace Wallet
                </button>
              ) : (
                <a
                  href="https://www.lace.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="welcome-btn welcome-btn--secondary"
                >
                  🔌 Get Lace Wallet
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>
          Built on{' '}
          <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="footer-link">
            Midnight Network
          </a>{' '}
          · Powered by{' '}
          <a href="https://www.lace.io" target="_blank" rel="noopener noreferrer" className="footer-link">
            Lace Wallet
          </a>
        </p>
      </footer>
    </div>
  )
}
