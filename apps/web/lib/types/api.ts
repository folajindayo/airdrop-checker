/**
 * API type definitions
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
  details?: Record<string, any>;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

// Airdrop API types
export interface Airdrop {
  id: string;
  name: string;
  description: string;
  chain: Chain;
  status: AirdropStatus;
  totalAmount: string;
  participants: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  logo?: string;
  website?: string;
  twitter?: string;
  createdAt: string;
  updatedAt: string;
}

export type AirdropStatus = "active" | "upcoming" | "ended" | "claimed";

export type Chain =
  | "ethereum"
  | "polygon"
  | "bsc"
  | "arbitrum"
  | "optimism"
  | "avalanche"
  | "base"
  | "solana";

export interface EligibilityResult {
  eligible: boolean;
  amount?: string;
  reason?: string;
  claimUrl?: string;
  requirements: RequirementCheck[];
}

export interface RequirementCheck {
  requirement: string;
  met: boolean;
  details?: string;
}

export interface UserAirdrop {
  airdrop: Airdrop;
  eligible: boolean;
  claimed: boolean;
  amount?: string;
  claimedAt?: string;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  balance?: string;
  ens?: string;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export type NotificationType = "success" | "error" | "warning" | "info";

// Request types
export interface AirdropFiltersRequest {
  status?: AirdropStatus[];
  chain?: Chain[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "participants" | "name";
  sortOrder?: "asc" | "desc";
}

export interface EligibilityCheckRequest {
  address: string;
  airdropId: string;
}

export interface ClaimRequest {
  address: string;
  airdropId: string;
  signature: string;
}

