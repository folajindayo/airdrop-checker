/**
 * Wallet Types
 */

export interface WalletData {
  address: string;
  chainId: number;
  balance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
  value: number;
  logo?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

