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

  // Default: disconnected — always show Connect button.
  // The Midnight dapp connector (window.midnight.mnLace) is injected by the
  // Midnight-enabled Lace build. We don't gate the button on detection at
  // render time because the extension may inject after the React tree mounts.
  // If the connector is absent at click time, connect() will surface a clear
  // error message explaining what the user needs to do.
  return (
    <div className="wallet-panel wallet-panel--disconnected">
      <button className="btn btn--primary" onClick={connect}>
        Connect Lace Wallet
      </button>
    </div>
  )
}
