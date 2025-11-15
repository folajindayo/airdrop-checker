/**
 * @fileoverview Network switcher component
 * 
 * Comprehensive network/chain switching UI
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Network information
 */
export interface NetworkInfo {
  /** Network ID */
  id: number;
  /** Network name */
  name: string;
  /** Short name */
  shortName: string;
  /** Chain ID in hex */
  chainId: string;
  /** Native currency symbol */
  currency: string;
  /** RPC URL */
  rpcUrl: string;
  /** Block explorer URL */
  explorerUrl: string;
  /** Icon URL or emoji */
  icon?: string;
  /** Is testnet */
  testnet?: boolean;
}

/**
 * Network switcher props
 */
export interface NetworkSwitcherProps {
  /** Currently selected network */
  currentNetwork?: NetworkInfo;
  /** Available networks */
  networks?: NetworkInfo[];
  /** Callback when network is changed */
  onNetworkChange?: (network: NetworkInfo) => Promise<void>;
  /** Show testnet networks */
  showTestnets?: boolean;
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Default networks
 */
const DEFAULT_NETWORKS: NetworkInfo[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    chainId: '0x1',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    icon: '⟠',
    testnet: false,
  },
  {
    id: 137,
    name: 'Polygon Mainnet',
    shortName: 'Polygon',
    chainId: '0x89',
    currency: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '⬡',
    testnet: false,
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    chainId: '0x38',
    currency: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    icon: '⬡',
    testnet: false,
  },
  {
    id: 43114,
    name: 'Avalanche C-Chain',
    shortName: 'Avalanche',
    chainId: '0xa86a',
    currency: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    icon: '△',
    testnet: false,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    chainId: '0xa4b1',
    currency: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    icon: '◢',
    testnet: false,
  },
  {
    id: 10,
    name: 'Optimism',
    shortName: 'Optimism',
    chainId: '0xa',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '◯',
    testnet: false,
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'Sepolia',
    chainId: '0xaa36a7',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
    icon: '⟠',
    testnet: true,
  },
];

/**
 * Network switcher component
 */
export function NetworkSwitcher({
  currentNetwork,
  networks = DEFAULT_NETWORKS,
  onNetworkChange,
  showTestnets = false,
  className,
  disabled = false,
}: NetworkSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo | null>(null);

  // Filter networks based on testnet preference
  const filteredNetworks = networks.filter(
    (network) => showTestnets || !network.testnet
  );

  const handleNetworkSwitch = async (network: NetworkInfo) => {
    if (disabled || network.id === currentNetwork?.id) {
      return;
    }

    setIsSwitching(true);
    setSelectedNetwork(network);

    try {
      await onNetworkChange?.(network);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsSwitching(false);
      setSelectedNetwork(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-white dark:bg-gray-800',
          'border border-gray-300 dark:border-gray-600',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Switch network"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentNetwork ? (
          <>
            {currentNetwork.icon && (
              <span className="text-lg">{currentNetwork.icon}</span>
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              {currentNetwork.shortName}
            </span>
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            Select Network
          </span>
        )}

        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-72 max-h-96 overflow-y-auto',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-xl',
            'animate-in fade-in-0 slide-in-from-top-2'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white">
              Select Network
            </h3>
          </div>

          <div className="p-2">
            {filteredNetworks.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No networks available
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNetworks.map((network) => {
                  const isSelected = currentNetwork?.id === network.id;
                  const isLoading = isSwitching && selectedNetwork?.id === network.id;

                  return (
                    <button
                      key={network.id}
                      onClick={() => handleNetworkSwitch(network)}
                      disabled={isSelected || isSwitching}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                        'transition-colors',
                        'disabled:cursor-not-allowed',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
                        isSwitching && !isSelected && 'opacity-50'
                      )}
                    >
                      {network.icon && (
                        <span className="text-xl">{network.icon}</span>
                      )}

                      <div className="flex-1 text-left">
                        <div className="font-medium">{network.shortName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {network.currency}
                        </div>
                      </div>

                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}

                      {isSelected && !isLoading && (
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}

                      {network.testnet && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                          Testnet
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {showTestnets && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <p className="px-2 text-xs text-gray-500 dark:text-gray-400">
                💡 Testnet networks are for development only
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example usage:
 * 
 * <NetworkSwitcher
 *   currentNetwork={{
 *     id: 1,
 *     name: 'Ethereum Mainnet',
 *     shortName: 'Ethereum',
 *     chainId: '0x1',
 *     currency: 'ETH',
 *     rpcUrl: 'https://mainnet.infura.io/v3/',
 *     explorerUrl: 'https://etherscan.io',
 *     icon: '⟠',
 *   }}
 *   onNetworkChange={async (network) => {
 *     // Handle network switch
 *   }}
 *   showTestnets={false}
 * />
 */

