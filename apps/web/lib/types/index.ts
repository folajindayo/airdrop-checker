/**
 * Type definitions
 */

export interface Airdrop {
  id: string;
  name: string;
  description: string;
  chain: string;
  status: AirdropStatus;
  totalAmount: string;
  participants: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  logo?: string;
  website?: string;
  twitter?: string;
}

export type AirdropStatus = "active" | "upcoming" | "ended" | "claimed";

export interface WalletInfo {
  address: string;
  chainId: number;
  balance?: string;
  connected: boolean;
}

export interface EligibilityCheck {
  eligible: boolean;
  reason?: string;
  requirements: RequirementCheck[];
}

export interface RequirementCheck {
  name: string;
  met: boolean;
  details?: string;
}

export interface AirdropFilters {
  status?: string[];
  chain?: string[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  data?: Record<string, any>;
}

export interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
