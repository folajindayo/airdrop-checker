/**
 * Blockchain-related types
 * @module types/blockchain
 */

import type { Address, TxHash, Status } from './common';

/**
 * Supported chain IDs
 */
export type ChainId = 1 | 56 | 137 | 250 | 324 | 8453 | 42161 | 43114;

/**
 * Chain configuration
 */
export interface Chain {
  id: ChainId;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  testnet: boolean;
}

/**
 * Token information
 */
export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
}

/**
 * Token balance
 */
export interface TokenBalance extends Token {
  balance: string;
  balanceUSD: number;
}

/**
 * Native balance
 */
export interface NativeBalance {
  balance: string;
  balanceUSD: number;
  symbol: string;
}

/**
 * Chain balance
 */
export interface ChainBalance {
  chainId: ChainId;
  chainName: string;
  nativeBalance: NativeBalance;
  tokenBalances: TokenBalance[];
  totalValueUSD: number;
}

/**
 * Transaction
 */
export interface Transaction {
  hash: TxHash;
  from: Address;
  to: Address;
  value: string;
  valueUSD?: number;
  gasPrice?: string;
  gasUsed?: string;
  timestamp: string;
  blockNumber: number;
  status: Status;
  method?: string;
  chainId?: ChainId;
}

/**
 * Gas price
 */
export interface GasPrice {
  low: number;
  medium: number;
  high: number;
  instant: number;
  timestamp: string;
}

/**
 * Gas estimate
 */
export interface GasEstimate {
  gasLimit: number;
  estimatedCost: {
    low: string;
    medium: string;
    high: string;
    instant: string;
  };
}

/**
 * NFT metadata
 */
export interface NFT {
  tokenId: string;
  contractAddress: Address;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  owner: Address;
  metadata?: Record<string, any>;
  attributes?: NFTAttribute[];
}

/**
 * NFT attribute
 */
export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: string;
}

/**
 * NFT collection
 */
export interface NFTCollection {
  address: Address;
  name: string;
  symbol: string;
  totalSupply: number;
  description?: string;
  image?: string;
  website?: string;
  floorPrice?: number;
  volumeTraded?: number;
}

/**
 * Smart contract
 */
export interface SmartContract {
  address: Address;
  name?: string;
  verified: boolean;
  abi?: any[];
  sourceCode?: string;
}

/**
 * Block information
 */
export interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  gasLimit: string;
  miner: Address;
}

