/**
 * @fileoverview Wallet management hook
 * 
 * Custom hook for managing wallet connection, state, and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Wallet type
 */
export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
}

/**
 * Wallet state
 */
export interface WalletState {
  /** Is wallet connected */
  isConnected: boolean;
  /** Is connecting */
  isConnecting: boolean;
  /** Connected address */
  address?: string;
  /** Chain ID */
  chainId?: number;
  /** Balance in native currency */
  balance?: string;
  /** Wallet type */
  walletType?: WalletType;
  /** Error message */
  error?: string;
}

/**
 * Use wallet hook return type
 */
export interface UseWalletReturn {
  /** Wallet state */
  state: WalletState;
  /** Connect wallet */
  connect: (walletType: WalletType) => Promise<void>;
  /** Disconnect wallet */
  disconnect: () => Promise<void>;
  /** Switch chain */
  switchChain: (chainId: number) => Promise<void>;
  /** Refresh balance */
  refreshBalance: () => Promise<void>;
  /** Sign message */
  signMessage: (message: string) => Promise<string>;
}

/**
 * Chain configurations
 */
const CHAINS: Record<number, { name: string; rpcUrl: string }> = {
  1: { name: 'Ethereum Mainnet', rpcUrl: 'https://mainnet.infura.io/v3/' },
  137: { name: 'Polygon Mainnet', rpcUrl: 'https://polygon-rpc.com' },
  56: { name: 'BNB Smart Chain', rpcUrl: 'https://bsc-dataseed.binance.org' },
  43114: { name: 'Avalanche C-Chain', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
  42161: { name: 'Arbitrum One', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  10: { name: 'Optimism', rpcUrl: 'https://mainnet.optimism.io' },
};

/**
 * Get ethereum provider
 */
function getEthereumProvider(walletType: WalletType): any {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  switch (walletType) {
    case WalletType.METAMASK:
      return ethereum.isMetaMask ? ethereum : null;
    case WalletType.COINBASE:
      return ethereum.isCoinbaseWallet ? ethereum : null;
    default:
      return ethereum;
  }
}

/**
 * Use wallet hook
 */
export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
  });

  /**
   * Update wallet state
   */
  const updateState = useCallback((updates: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Get balance
   */
  const getBalance = useCallback(async (address: string): Promise<string> => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('No ethereum provider found');

    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    // Convert from wei to ether
    const balanceInEther = parseInt(balance, 16) / 1e18;
    return balanceInEther.toString();
  }, []);

  /**
   * Refresh balance
   */
  const refreshBalance = useCallback(async () => {
    if (!state.address) return;

    try {
      const balance = await getBalance(state.address);
      updateState({ balance });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [state.address, getBalance, updateState]);

  /**
   * Connect wallet
   */
  const connect = useCallback(async (walletType: WalletType) => {
    updateState({ isConnecting: true, error: undefined });

    try {
      const provider = getEthereumProvider(walletType);
      if (!provider) {
        throw new Error(`${walletType} is not installed`);
      }

      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Get chain ID
      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      // Get balance
      const balance = await getBalance(address);

      updateState({
        isConnected: true,
        isConnecting: false,
        address,
        chainId: parseInt(chainId, 16),
        balance,
        walletType,
        error: undefined,
      });

      // Store connection in localStorage
      localStorage.setItem('wallet_type', walletType);
      localStorage.setItem('wallet_address', address);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      updateState({
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      });
    }
  }, [getBalance, updateState]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    updateState({
      isConnected: false,
      isConnecting: false,
      address: undefined,
      chainId: undefined,
      balance: undefined,
      walletType: undefined,
      error: undefined,
    });

    // Clear stored connection
    localStorage.removeItem('wallet_type');
    localStorage.removeItem('wallet_address');
  }, [updateState]);

  /**
   * Switch chain
   */
  const switchChain = useCallback(async (chainId: number) => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error('No ethereum provider found');

      const chainIdHex = `0x${chainId.toString(16)}`;

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });

        updateState({ chainId });
      } catch (switchError: any) {
        // Chain not added to wallet, try to add it
        if (switchError.code === 4902) {
          const chain = CHAINS[chainId];
          if (!chain) {
            throw new Error(`Chain ${chainId} not supported`);
          }

          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
              },
            ],
          });

          updateState({ chainId });
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('Failed to switch chain:', error);
      updateState({ error: error.message || 'Failed to switch chain' });
      throw error;
    }
  }, [updateState]);

  /**
   * Sign message
   */
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!state.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error('No ethereum provider found');

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, state.address],
      });

      return signature;
    } catch (error: any) {
      console.error('Failed to sign message:', error);
      throw new Error(error.message || 'Failed to sign message');
    }
  }, [state.address]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (typeof window === 'undefined' || !state.isConnected) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        updateState({ address: accounts[0] });
        getBalance(accounts[0]).then((balance) => {
          updateState({ balance });
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      updateState({ chainId: parseInt(chainId, 16) });
      if (state.address) {
        getBalance(state.address).then((balance) => {
          updateState({ balance });
        });
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('disconnect', handleDisconnect);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [state.isConnected, state.address, getBalance, disconnect, updateState]);

  /**
   * Auto-connect on mount if previously connected
   */
  useEffect(() => {
    const walletType = localStorage.getItem('wallet_type') as WalletType;
    const walletAddress = localStorage.getItem('wallet_address');

    if (walletType && walletAddress) {
      // Auto-connect silently
      connect(walletType).catch((error) => {
        console.error('Auto-connect failed:', error);
        localStorage.removeItem('wallet_type');
        localStorage.removeItem('wallet_address');
      });
    }
  }, [connect]);

  return {
    state,
    connect,
    disconnect,
    switchChain,
    refreshBalance,
    signMessage,
  };
}

/**
 * Example usage:
 * 
 * const { state, connect, disconnect, switchChain } = useWallet();
 * 
 * // Connect wallet
 * await connect(WalletType.METAMASK);
 * 
 * // Switch chain
 * await switchChain(137); // Polygon
 * 
 * // Disconnect
 * await disconnect();
 */

