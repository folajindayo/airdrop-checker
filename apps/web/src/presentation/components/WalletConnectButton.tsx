/**
 * Wallet Connect Button Component
 * Button to connect/disconnect wallet
 */

'use client';

import { useState } from 'react';

export interface WalletConnectButtonProps {
  address?: string;
  isConnected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  className?: string;
}

export function WalletConnectButton({
  address,
  isConnected,
  onConnect,
  onDisconnect,
  className = '',
}: WalletConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
          {formatAddress(address)}
        </div>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className={`px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

