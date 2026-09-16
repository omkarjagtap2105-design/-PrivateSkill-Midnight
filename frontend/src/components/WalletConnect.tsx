import type { ConnectionState } from '../hooks/useMidnight'

interface WalletConnectProps {
  connectionState: ConnectionState
  walletAddress: string | null
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}…${address.slice(-8)}`
}

export function WalletConnect({
  connectionState,
  walletAddress,
  error,
  connect,
  disconnect,
}: WalletConnectProps) {
  const laceInstalled = typeof window !== 'undefined' && !!window.midnight?.mnLace

  if (!laceInstalled && connectionState === 'disconnected') {
    return (
      <div className="wallet-panel wallet-panel--not-installed">
        <span className="wallet-icon">🌑</span>
        <p className="wallet-msg">
          Lace wallet not detected.{' '}
          <a
            href="https://www.lace.io"
            target="_blank"
            rel="noopener noreferrer"
            className="wallet-link"
          >
            Install Lace
          </a>{' '}
          to connect.
        </p>
      </div>
    )
  }

  if (connectionState === 'connected' && walletAddress) {
    return (
      <div className="wallet-panel wallet-panel--connected">
        <div className="wallet-status">
          <span className="wallet-dot wallet-dot--connected" aria-hidden="true" />
          <span className="wallet-label">Connected</span>
        </div>
        <code className="wallet-address" title={walletAddress}>
          {truncateAddress(walletAddress)}
        </code>
        <button className="btn btn--secondary" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  if (connectionState === 'connecting') {
    return (
      <div className="wallet-panel wallet-panel--connecting">
        <span className="spinner" aria-label="Connecting…" />
        <span className="wallet-msg">Connecting to Lace…</span>
      </div>
    )
  }

  if (connectionState === 'error' && error) {
    return (
      <div className="wallet-panel wallet-panel--error">
        <p className="wallet-error" role="alert">
          {error}
        </p>
        <button className="btn btn--primary" onClick={connect}>
          Try Again
        </button>
      </div>
    )
  }

  // Default: disconnected
  return (
    <div className="wallet-panel wallet-panel--disconnected">
      <button className="btn btn--primary" onClick={connect}>
        Connect Lace Wallet
      </button>
    </div>
  )
}
