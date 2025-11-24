/**
 * Shared Type Definitions
 * 
 * Common types used across the application
 */

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Blockchain types
 */
export interface Chain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  chainId: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  chainId: number;
}

/**
 * Wallet types
 */
export interface Wallet {
  address: string;
  chainId: number;
  balance: string;
  ensName?: string;
}

export interface WalletActivity {
  address: string;
  transactionCount: number;
  firstActivity: string;
  lastActivity: string;
  activeChains: number[];
}

/**
 * Airdrop types
 */
export interface Airdrop {
  id: string;
  name: string;
  description: string;
  status: 'confirmed' | 'rumored' | 'speculative' | 'expired';
  value?: number;
  category: string;
  chains: number[];
  startDate?: string;
  endDate?: string;
  criteria: AirdropCriteria[];
}

export interface AirdropCriteria {
  id: string;
  description: string;
  required: boolean;
  completed?: boolean;
}

export interface AirdropEligibility {
  airdropId: string;
  address: string;
  eligible: boolean;
  score: number;
  completedCriteria: number;
  totalCriteria: number;
  details: string[];
}

/**
 * Utility types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ValueOf<T> = T[keyof T];

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

