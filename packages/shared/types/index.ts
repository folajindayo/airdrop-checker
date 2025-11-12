/**
 * Core types for the Airdrop Finder application
 */

// Re-export all types
export * from './api';
export * from './goldrush';
export * from './guards';

/**
 * Airdrop project status
 * @typedef {('confirmed'|'rumored'|'expired'|'speculative')} AirdropStatus
 */
export type AirdropStatus = 'confirmed' | 'rumored' | 'expired' | 'speculative';

/**
 * Criteria for airdrop eligibility
 */
export interface EligibilityCriteria {
  /** Human-readable description of the criterion */
  description: string;
  /** Programmatic check string for evaluation */
  check: string;
  /** Whether the criterion was met (optional, set during evaluation) */
  met?: boolean;
}

/**
 * Represents an airdrop project with eligibility criteria
 */
export interface AirdropProject {
  /** Unique identifier for the project */
  id: string;
  /** Display name of the project */
  name: string;
  /** Optional description of the project */
  description?: string;
  /** Current status of the airdrop */
  status: AirdropStatus;
  /** URL to project logo */
  logoUrl?: string;
  /** Official website URL */
  websiteUrl?: string;
  /** Twitter/X profile URL */
  twitterUrl?: string;
  /** URL to claim the airdrop */
  claimUrl?: string;
  /** Array of eligibility criteria */
  criteria: EligibilityCriteria[];
  /** Supported blockchain networks */
  chains?: string[];
  /** Estimated value (e.g., "$100-$500") */
  estimatedValue?: string;
  /** Date of snapshot (if applicable) */
  snapshotDate?: string;
  /** Project creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
}

export type TrendingSignalType =
  | 'status'
  | 'value'
  | 'snapshot'
  | 'activity'
  | 'claim'
  | 'chain';

export interface TrendingSignal {
  type: TrendingSignalType;
  label: string;
  weight: number;
}

export interface TrendingProjectSummary {
  projectId: string;
  name: string;
  status: AirdropStatus;
  trendingScore: number;
  signals: TrendingSignal[];
  chains: string[];
  estimatedValue?: string;
  snapshotDate?: string;
  claimUrl?: string;
  websiteUrl?: string;
  logoUrl?: string;
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

