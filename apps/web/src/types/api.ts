/**
 * API Types and Interfaces
 * 
 * Centralized type definitions for API requests and responses.
 */

/**
 * Common API Response Structure
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination Response
 */
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Sort Parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Airdrop Types
 */
export interface Airdrop {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  status: 'active' | 'upcoming' | 'ended' | 'distributed';
  category?: string;
  totalValue?: number;
  eligibilityStart?: string;
  eligibilityEnd?: string;
  distributionDate?: string;
  requirements?: AirdropRequirement[];
  createdAt: string;
  updatedAt: string;
}

export interface AirdropRequirement {
  type: 'transaction' | 'balance' | 'interaction' | 'social' | 'other';
  description: string;
  value?: number;
  met?: boolean;
}

export interface AirdropEligibility {
  eligible: boolean;
  airdropId: string;
  airdropName: string;
  address: string;
  score: number;
  maxScore: number;
  requirements: AirdropRequirement[];
  estimatedReward?: number;
  checkedAt: string;
}

/**
 * Portfolio Types
 */
export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: number;
  decimals: number;
  logo?: string;
  price?: number;
  priceChange24h?: number;
}

export interface ChainBalance {
  chainId: number;
  chainName: string;
  nativeBalance: string;
  nativeBalanceUSD: number;
  tokenBalances: TokenBalance[];
  totalValueUSD: number;
}

export interface Portfolio {
  address: string;
  totalValueUSD: number;
  chains: ChainBalance[];
  lastUpdated: string;
}

/**
 * Gas Tracker Types
 */
export interface GasPrice {
  low: number;
  medium: number;
  high: number;
  instant: number;
  timestamp: string;
}

export interface GasEstimate {
  gasLimit: number;
  estimatedCost: {
    low: string;
    medium: string;
    high: string;
    instant: string;
  };
}

export interface GasTracker {
  chainId: number;
  chainName: string;
  prices: GasPrice;
  estimates?: GasEstimate[];
}

/**
 * Transaction Types
 */
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUSD?: number;
  gasPrice?: string;
  gasUsed?: string;
  timestamp: string;
  blockNumber: number;
  status: 'success' | 'failed' | 'pending';
  method?: string;
  chainId?: number;
}

export interface TransactionHistory {
  address: string;
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Trending Types
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
 * Health Check Types
 */
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  services?: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
}

/**
 * Rate Limit Types
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * User Types
 */
export interface User {
  id: string;
  address: string;
  email?: string;
  username?: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    airdropAlerts?: boolean;
  };
}

/**
 * NFT Types
 */
export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  owner: string;
  metadata?: Record<string, any>;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: string;
}

export interface NFTCollection {
  address: string;
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
 * DeFi Types
 */
export interface DeFiPosition {
  protocol: string;
  type: 'lending' | 'borrowing' | 'staking' | 'liquidity' | 'farming';
  asset: string;
  amount: string;
  valueUSD: number;
  apr?: number;
  rewards?: TokenBalance[];
}

export interface DeFiPortfolio {
  address: string;
  totalValueUSD: number;
  positions: DeFiPosition[];
  lastUpdated: string;
}

/**
 * Statistics Types
 */
export interface Statistics {
  totalUsers: number;
  totalAirdrops: number;
  totalValueDistributed: number;
  activeAirdrops: number;
  upcomingAirdrops: number;
}

/**
 * Search Types
 */
export interface SearchResult {
  type: 'address' | 'transaction' | 'airdrop' | 'token';
  id: string;
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  type: 'airdrop' | 'transaction' | 'price_alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

/**
 * Error Types
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

/**
 * Blockchain Types
 */
export interface Chain {
  id: number;
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
 * Cache Types
 */
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * WebSocket Types
 */
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

/**
 * Export Types
 */
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields?: string[];
  filters?: FilterParams;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Analytics Types
 */
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Webhook Types
 */
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt: string;
  lastTriggered?: string;
}

/**
 * Feature Flag Types
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

