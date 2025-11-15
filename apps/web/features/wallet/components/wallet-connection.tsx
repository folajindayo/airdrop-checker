/**
 * @fileoverview Wallet connection component
 * 
 * Comprehensive wallet connection UI with multi-wallet support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Supported wallet types
 */
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  RAINBOW = 'rainbow',
  TRUST_WALLET = 'trustwallet',
}

/**
 * Wallet info
 */
export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  installed?: boolean;
  downloadUrl?: string;
}

/**
 * Connection state
 */
export interface ConnectionState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  wallet?: WalletType;
}

/**
 * Wallet connection props
 */
export interface WalletConnectionProps {
  /** Current connection state */
  connectionState?: ConnectionState;
  /** Callback when wallet is selected */
  onConnect?: (wallet: WalletType) => Promise<void>;
  /** Callback when disconnect is requested */
  onDisconnect?: () => Promise<void>;
  /** Callback when account is changed */
  onAccountChange?: (address: string) => void;
  /** Callback when chain is changed */
  onChainChange?: (chainId: number) => void;
  /** Custom class name */
  className?: string;
  /** Show disconnect button */
  showDisconnect?: boolean;
}

/**
 * Available wallets
 */
const WALLETS: WalletInfo[] = [
  {
    type: WalletType.METAMASK,
    name: 'MetaMask',
    icon: '/icons/metamask.svg',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    type: WalletType.WALLET_CONNECT,
    name: 'WalletConnect',
    icon: '/icons/walletconnect.svg',
  },
  {
    type: WalletType.COINBASE,
    name: 'Coinbase Wallet',
    icon: '/icons/coinbase.svg',
    downloadUrl: 'https://www.coinbase.com/wallet',
  },
  {
    type: WalletType.RAINBOW,
    name: 'Rainbow',
    icon: '/icons/rainbow.svg',
    downloadUrl: 'https://rainbow.me/',
  },
  {
    type: WalletType.TRUST_WALLET,
    name: 'Trust Wallet',
    icon: '/icons/trustwallet.svg',
    downloadUrl: 'https://trustwallet.com/',
  },
];

/**
 * Wallet connection component
 */
export function WalletConnection({
  connectionState = { isConnected: false },
  onConnect,
  onDisconnect,
  onAccountChange,
  onChainChange,
  className,
  showDisconnect = true,
}: WalletConnectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  // Check wallet installation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    WALLETS.forEach((wallet) => {
      switch (wallet.type) {
        case WalletType.METAMASK:
          wallet.installed = !!(window as any).ethereum?.isMetaMask;
          break;
        case WalletType.COINBASE:
          wallet.installed = !!(window as any).ethereum?.isCoinbaseWallet;
          break;
        case WalletType.TRUST_WALLET:
          wallet.installed = !!(window as any).ethereum?.isTrust;
          break;
        default:
          wallet.installed = true; // WalletConnect doesn't require installation
      }
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !connectionState.isConnected) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        onAccountChange?.(accounts[0]);
      } else {
        onDisconnect?.();
      }
    };

    const handleChainChanged = (chainId: string) => {
      onChainChange?.(parseInt(chainId, 16));
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [connectionState.isConnected, onAccountChange, onChainChange, onDisconnect]);

  const handleConnect = async (wallet: WalletType) => {
    setIsConnecting(true);
    setSelectedWallet(wallet);

    try {
      await onConnect?.(wallet);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect?.();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connectionState.isConnected && connectionState.address) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              {formatAddress(connectionState.address)}
            </span>
          </div>
        </div>

        {showDisconnect && (
          <button
            onClick={handleDisconnect}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'bg-red-100 text-red-900 hover:bg-red-200',
              'dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
              'transition-colors'
            )}
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-6 py-3 text-sm font-medium rounded-lg',
          'bg-blue-600 text-white hover:bg-blue-700',
          'dark:bg-blue-500 dark:hover:bg-blue-600',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        Connect Wallet
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Wallet list */}
          <div
            className={cn(
              'absolute right-0 top-full mt-2 z-50',
              'w-80 p-4 rounded-lg shadow-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'animate-in fade-in-0 slide-in-from-top-2'
            )}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Connect a Wallet
            </h3>

            <div className="space-y-2">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.type}
                  onClick={() => handleConnect(wallet.type)}
                  disabled={isConnecting && selectedWallet === wallet.type}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg',
                    'border border-gray-200 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {/* Icon placeholder */}
                    <span className="text-xs font-bold">
                      {wallet.name[0]}
                    </span>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {wallet.name}
                    </div>
                    {!wallet.installed && wallet.downloadUrl && (
                      <div className="text-xs text-gray-500">
                        Not installed
                      </div>
                    )}
                  </div>

                  {isConnecting && selectedWallet === wallet.type && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}

                  {!wallet.installed && wallet.downloadUrl && (
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Install
                    </a>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By connecting a wallet, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <WalletConnection
 *   connectionState={{
 *     isConnected: true,
 *     address: '0x1234...5678',
 *     chainId: 1,
 *     wallet: WalletType.METAMASK,
 *   }}
 *   onConnect={async (wallet) => {
 *     // Handle wallet connection
 *   }}
 *   onDisconnect={async () => {
 *     // Handle wallet disconnection
 *   }}
 * />
 */

