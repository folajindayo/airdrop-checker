/**
 * WalletConnect Component
 */

'use client';

import { useWalletContext } from '../contexts/WalletContext';

export function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWalletContext();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}

