/**
 * Core types for the Airdrop Finder application
 */

export type AirdropStatus = 'confirmed' | 'rumored' | 'expired' | 'speculative';

export interface EligibilityCriteria {
  description: string;
  check: string;
  met?: boolean;
}

export interface AirdropProject {
  id: string;
  name: string;
  description?: string;
  status: AirdropStatus;
  logoUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  claimUrl?: string;
  criteria: EligibilityCriteria[];
  chains?: string[];
  estimatedValue?: string;
  snapshotDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CheckResult {
  address: string;
  overallScore: number;
  airdrops: AirdropCheckResult[];
  timestamp: number;
}

export interface AirdropCheckResult {
  project: string;
  projectId: string;
  status: AirdropStatus;
  score: number;
  criteria: CriteriaResult[];
  logoUrl?: string;
  websiteUrl?: string;
  claimUrl?: string;
}

export interface CriteriaResult {
  desc: string;
  met: boolean;
}

export interface UserActivity {
  address: string;
  chains: ChainActivity[];
  protocols: ProtocolInteraction[];
  nfts: NFTActivity[];
  tokens: TokenActivity[];
  bridges: BridgeActivity[];
  dexSwaps: DEXSwap[];
}

export interface ChainActivity {
  chainId: number;
  chainName: string;
  transactionCount: number;
  firstActivity?: Date;
  lastActivity?: Date;
}

export interface ProtocolInteraction {
  protocol: string;
  contractAddress: string;
  chainId: number;
  interactionCount: number;
  firstInteraction?: Date;
  lastInteraction?: Date;
}

export interface NFTActivity {
  contractAddress: string;
  tokenId?: string;
  chainId: number;
  type: 'mint' | 'transfer' | 'burn';
  platform?: string;
  timestamp?: Date;
}

export interface TokenActivity {
  tokenAddress: string;
  symbol: string;
  chainId: number;
  balance: string;
  transfers: number;
}

export interface BridgeActivity {
  bridge: string;
  fromChain: number;
  toChain: number;
  count: number;
  lastBridge?: Date;
}

export interface DEXSwap {
  dex: string;
  chainId: number;
  count: number;
  lastSwap?: Date;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface GoldRushTransaction {
  block_signed_at: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  value: string;
  gas_spent: string;
  log_events?: GoldRushLogEvent[];
}

export interface GoldRushLogEvent {
  sender_address: string;
  sender_name?: string;
  decoded?: {
    name: string;
    signature: string;
    params?: any[];
  };
}

export interface GoldRushNFT {
  contract_address: string;
  token_id: string;
  token_balance: string;
  external_data?: {
    name?: string;
    image?: string;
  };
}

export interface ScoringWeights {
  confirmed: number;
  rumored: number;
  speculative: number;
  expired: number;
}

