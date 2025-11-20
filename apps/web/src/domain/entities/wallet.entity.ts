/**
 * Wallet Entity
 * Core domain entity representing a connected wallet
 */

export interface WalletEntity {
  readonly address: string;
  readonly chainId: number;
  readonly ensName?: string;
  readonly balance: WalletBalance;
  readonly transactions: TransactionSummary;
  readonly eligibilityScore: number;
  readonly connectedAt: Date;
  readonly lastUpdated: Date;
}

export interface WalletBalance {
  native: string;
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  totalValueUSD: number;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  valueUSD: number;
  logoUrl?: string;
}

export interface NFTBalance {
  contractAddress: string;
  collectionName: string;
  tokenId: string;
  tokenURI?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionSummary {
  total: number;
  incoming: number;
  outgoing: number;
  failed: number;
  firstTransaction?: Date;
  lastTransaction?: Date;
  mostActiveProtocol?: string;
}

/**
 * Factory function to create a WalletEntity
 */
export function createWalletEntity(address: string, chainId: number): WalletEntity {
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid wallet address');
  }

  return {
    address: address.toLowerCase(),
    chainId,
    balance: {
      native: '0',
      tokens: [],
      nfts: [],
      totalValueUSD: 0,
    },
    transactions: {
      total: 0,
      incoming: 0,
      outgoing: 0,
      failed: 0,
    },
    eligibilityScore: 0,
    connectedAt: new Date(),
    lastUpdated: new Date(),
  };
}

/**
 * Type guard for WalletEntity
 */
export function isWalletEntity(obj: unknown): obj is WalletEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'address' in obj &&
    'chainId' in obj &&
    typeof (obj as WalletEntity).address === 'string'
  );
}

