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
    connect,
    disconnect,
    verifyThreshold,
  } = useMidnight()

  return (
    <div className="app">
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
            connect={connect}
            disconnect={disconnect}
          />
        </div>
      </header>

      <main className="app-main">
        {connectionState === 'connected' ? (
          <CircuitCall
            verifyThreshold={verifyThreshold}
            isProving={isProving}
            proofStep={proofStep}
            lastResult={lastResult}
          />
        ) : (
          <div className="welcome-card">
            <h2 className="welcome-card__title">Welcome to PrivateSkill</h2>
            <p className="welcome-card__body">
              Connect your <strong>Lace wallet</strong> to start verifying skill credentials
              with zero-knowledge proofs on the Midnight Network.
            </p>
            <ul className="privacy-list">
              <li>✅ Your exact score is <strong>never revealed</strong></li>
              <li>✅ Proof is generated <strong>locally in your wallet</strong></li>
              <li>✅ Only a boolean result is stored on-chain</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built on{' '}
          <a
            href="https://midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Midnight Network
          </a>{' '}
          · Powered by{' '}
          <a
            href="https://www.lace.io"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Lace Wallet
          </a>
        </p>
      </footer>
    </div>
  )
}
