/**
 * Blockchain-related type definitions
 */

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export interface BlockchainNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
}
