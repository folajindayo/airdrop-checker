/**
 * Wallet-related type definitions
 */

export interface WalletConnection {
  address: string;
  chainId: number;
  connected: boolean;
}

export interface WalletHealth {
  score: number;
  risks: string[];
  recommendations: string[];
}
