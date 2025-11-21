/**
 * Airdrop Repository Interface
 * Defines the contract for airdrop data persistence
 */

import { AirdropEntity } from '../entities/airdrop.entity';

export interface AirdropFilters {
  chainId?: number;
  status?: string;
  minAmount?: bigint;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAirdropRepository {
  /**
   * Find airdrop by ID
   */
  findById(id: string): Promise<AirdropEntity | null>;

  /**
   * Find airdrops with filters and pagination
   */
  find(
    filters: AirdropFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AirdropEntity>>;

  /**
   * Find all active airdrops
   */
  findActive(): Promise<AirdropEntity[]>;

  /**
   * Find airdrops by chain ID
   */
  findByChainId(chainId: number): Promise<AirdropEntity[]>;

  /**
   * Find airdrops by wallet eligibility
   */
  findEligibleForWallet(walletAddress: string): Promise<AirdropEntity[]>;

  /**
   * Find upcoming airdrops
   */
  findUpcoming(limit?: number): Promise<AirdropEntity[]>;

  /**
   * Create new airdrop
   */
  create(airdrop: AirdropEntity): Promise<AirdropEntity>;

  /**
   * Update existing airdrop
   */
  update(id: string, airdrop: AirdropEntity): Promise<AirdropEntity>;

  /**
   * Delete airdrop
   */
  delete(id: string): Promise<void>;

  /**
   * Count airdrops with filters
   */
  count(filters: AirdropFilters): Promise<number>;

  /**
   * Check if airdrop exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find airdrops by contract address
   */
  findByContractAddress(contractAddress: string): Promise<AirdropEntity[]>;

  /**
   * Bulk create airdrops
   */
  bulkCreate(airdrops: AirdropEntity[]): Promise<AirdropEntity[]>;

  /**
   * Mark airdrop as claimed for wallet
   */
  markAsClaimed(airdropId: string, walletAddress: string): Promise<void>;
}
