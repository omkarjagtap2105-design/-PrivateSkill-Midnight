import type { ConnectionState, WalletType } from '../hooks/useMidnight'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WalletConnectProps {
  connectionState: ConnectionState
  walletAddress: string | null
  error: string | null
  walletType: WalletType
  isLaceInstalled: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddress(address: string): string {
  if (address.length <= 20) return address
  return `${address.slice(0, 10)}…${address.slice(-6)}`
}

function walletLabel(walletType: WalletType): string {
  if (walletType === 'lace-midnight') return '🌑 Midnight Lace'
  if (walletType === 'lace-cardano') return '🟣 Lace'
  return '🟢'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WalletConnect({
  connectionState,
  walletAddress,
  error,
  walletType,
  isLaceInstalled,
  connect,
  disconnect,
}: WalletConnectProps) {

  // ── connecting ───────────────────────────────────────────────────────────
  if (connectionState === 'connecting') {
    return (
      <div className="wallet-connect wallet-connect--connecting" aria-live="polite">
        <span className="wallet-connect__spinner" role="status" aria-label="Connecting to wallet" />
        <span className="wallet-connect__connecting-label">Connecting…</span>
      </div>
    )
  }

  // ── connected ────────────────────────────────────────────────────────────
  if (connectionState === 'connected' && walletAddress) {
    return (
      <div className="wallet-connect wallet-connect--connected">
        <span className="wallet-connect__wallet-type">{walletLabel(walletType)}</span>
        <span
          className="wallet-connect__address"
          title={walletAddress}
          aria-label={`Connected wallet: ${walletAddress}`}
        >
          {truncateAddress(walletAddress)}
        </span>
        <button
          type="button"
          className="wallet-connect__button wallet-connect__button--disconnect"
          onClick={disconnect}
        >
          Disconnect
        </button>
      </div>
    )
  }

  // ── error ────────────────────────────────────────────────────────────────
  if (connectionState === 'error') {
    return (
      <div className="wallet-connect wallet-connect--error" role="alert">
        <span className="wallet-connect__icon" aria-hidden="true">⚠️</span>
        <p className="wallet-connect__error-message">{error ?? 'An unknown error occurred.'}</p>
        <div className="wallet-connect__error-actions">
          <button
            type="button"
            className="wallet-connect__button wallet-connect__button--retry"
            onClick={connect}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── disconnected — show connect options ──────────────────────────────────
  return (
    <div className="wallet-connect wallet-connect--disconnected">
      {isLaceInstalled ? (
        <div className="wallet-connect__options">
          <button
            type="button"
            className="wallet-connect__button wallet-connect__button--connect"
            onClick={connect}
          >
            🟣 Connect Lace Wallet
          </button>
        </div>
      ) : (
        <div className="wallet-connect wallet-connect--not-detected" role="alert">
          <span className="wallet-connect__icon" aria-hidden="true">🔌</span>
          <p className="wallet-connect__message">Lace wallet not detected.</p>
          <p className="wallet-connect__hint">
            Install Lace extension to connect.{' '}
            <a
              href="https://www.lace.io"
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-connect__link"
            >
              Download at lace.io
            </a>
          </p>
          <button
            type="button"
            className="wallet-connect__button wallet-connect__button--connect"
            onClick={connect}
          >
            🟣 Connect Lace Wallet
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletConnect
