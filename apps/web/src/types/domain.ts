/**
 * Domain-specific business types
 * @module types/domain
 */

import type { Address, BaseEntity } from './common';
import type { ChainBalance, TokenBalance } from './blockchain';

/**
 * Airdrop status
 */
export type AirdropStatus = 'active' | 'upcoming' | 'ended' | 'distributed';

/**
 * Airdrop requirement type
 */
export type RequirementType = 'transaction' | 'balance' | 'interaction' | 'social' | 'other';

/**
 * Airdrop requirement
 */
export interface AirdropRequirement {
  type: RequirementType;
  description: string;
  value?: number;
  met?: boolean;
}

/**
 * Airdrop
 */
export interface Airdrop extends BaseEntity {
  name: string;
  symbol: string;
  description?: string;
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  status: AirdropStatus;
  category?: string;
  totalValue?: number;
  eligibilityStart?: string;
  eligibilityEnd?: string;
  distributionDate?: string;
  requirements?: AirdropRequirement[];
}

/**
 * Airdrop eligibility
 */
export interface AirdropEligibility {
  eligible: boolean;
  airdropId: string;
  airdropName: string;
  address: Address;
  score: number;
  maxScore: number;
  requirements: AirdropRequirement[];
  estimatedReward?: number;
  checkedAt: string;
}

/**
 * Portfolio
 */
export interface Portfolio {
  address: Address;
  totalValueUSD: number;
  chains: ChainBalance[];
  lastUpdated: string;
}

/**
 * DeFi position type
 */
export type DeFiPositionType = 'lending' | 'borrowing' | 'staking' | 'liquidity' | 'farming';

/**
 * DeFi position
 */
export interface DeFiPosition {
  protocol: string;
  type: DeFiPositionType;
  asset: string;
  amount: string;
  valueUSD: number;
  apr?: number;
  rewards?: TokenBalance[];
}

/**
 * DeFi portfolio
 */
export interface DeFiPortfolio {
  address: Address;
  totalValueUSD: number;
  positions: DeFiPosition[];
  lastUpdated: string;
}

/**
 * Trending project
 */
export interface TrendingProject {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
  description?: string;
  category?: string;
  website?: string;
  twitter?: string;
  trendingScore: number;
  interactions24h: number;
  uniqueUsers24h: number;
  volumeUSD24h?: number;
}

/**
 * User
 */
export interface User extends BaseEntity {
  address: Address;
  email?: string;
  username?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

/**
 * Statistics
 */
export interface Statistics {
  totalUsers: number;
  totalAirdrops: number;
  totalValueDistributed: number;
  activeAirdrops: number;
  upcomingAirdrops: number;
}

/**
 * Search result type
 */
export type SearchResultType = 'address' | 'transaction' | 'airdrop' | 'token';

/**
 * Search result
 */
export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}

/**
 * Webhook
 */
export interface Webhook extends BaseEntity {
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  lastTriggered?: string;
}

