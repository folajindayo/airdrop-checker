/**
 * Wallet Types
 */

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | 'other';

export interface ConnectedWallet {
  address: string;
  chainId: number;
  provider: WalletProvider;
  ensName?: string;
  connectedAt: Date;
}

export interface WalletConnection {
  isConnected: boolean;
  wallet?: ConnectedWallet;
  isConnecting: boolean;
  error?: string;
}

