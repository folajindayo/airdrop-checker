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

/**
 * Types of signals for trending calculation
 */
export type TrendingSignalType =
  | 'status'
  | 'value'
  | 'snapshot'
  | 'activity'
  | 'claim'
  | 'chain';

/**
 * A signal that contributes to trending score
 */
export interface TrendingSignal {
  /** Type of the signal */
  type: TrendingSignalType;
  /** Human-readable label */
  label: string;
  /** Weight in trending calculation (0-1) */
  weight: number;
}

/**
 * Summary of a trending project
 */
export interface TrendingProjectSummary {
  /** Project identifier */
  projectId: string;
  /** Project name */
  name: string;
  /** Current status */
  status: AirdropStatus;
  /** Calculated trending score (0-100) */
  trendingScore: number;
  /** Signals contributing to trending score */
  signals: TrendingSignal[];
  /** Supported chains */
  chains: string[];
  /** Estimated airdrop value */
  estimatedValue?: string;
  /** Snapshot date if applicable */
  snapshotDate?: string;
  /** Claim URL if available */
  claimUrl?: string;
  /** Official website */
  websiteUrl?: string;
  /** Logo URL */
  logoUrl?: string;
  /** Last update time */
  updatedAt?: Date;
}

/**
 * Result of an eligibility check for an address
 */
export interface CheckResult {
  /** Wallet address checked */
  address: string;
  /** Overall eligibility score (0-100) */
  overallScore: number;
  /** Individual airdrop results */
  airdrops: AirdropCheckResult[];
  /** Unix timestamp of check */
  timestamp: number;
}

/**
 * Eligibility result for a single airdrop
 */
export interface AirdropCheckResult {
  /** Project name */
  project: string;
  /** Project identifier */
  projectId: string;
  /** Airdrop status */
  status: AirdropStatus;
  /** Eligibility score (0-100) */
  score: number;
  /** Evaluated criteria */
  criteria: CriteriaResult[];
  /** Project logo URL */
  logoUrl?: string;
  /** Project website URL */
  websiteUrl?: string;
  /** Claim URL if available */
  claimUrl?: string;
}

/**
 * Result of a single criterion evaluation
 */
export interface CriteriaResult {
  /** Criterion description */
  desc: string;
  /** Whether criterion was met */
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

