/**
 * Airdrop Repository Interface
 * Defines contract for airdrop data access
 */

import { AirdropEntity, AirdropStatus } from '../entities';

export interface AirdropRepository {
  /**
   * Find airdrop by ID
   */
  findById(id: string): Promise<AirdropEntity | null>;

  /**
   * Find all airdrops
   */
  findAll(filters?: AirdropFilters): Promise<AirdropEntity[]>;

  /**
   * Find airdrops by status
   */
  findByStatus(status: AirdropStatus): Promise<AirdropEntity[]>;

  /**
   * Find airdrops by protocol
   */
  findByProtocol(protocol: string): Promise<AirdropEntity[]>;

  /**
   * Check eligibility for wallet
   */
  checkEligibility(airdropId: string, walletAddress: string): Promise<EligibilityResult>;

  /**
   * Save airdrop
   */
  save(airdrop: AirdropEntity): Promise<AirdropEntity>;

  /**
   * Delete airdrop
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count airdrops
   */
  count(filters?: AirdropFilters): Promise<number>;
}

export interface AirdropFilters {
  status?: AirdropStatus[];
  chainIds?: number[];
  protocols?: string[];
  search?: string;
  verified?: boolean;
  featured?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'startDate' | 'endDate' | 'name' | 'protocol';
  sortOrder?: 'asc' | 'desc';
}

export interface EligibilityResult {
  eligible: boolean;
  airdropId: string;
  walletAddress: string;
  criteriaResults: CriteriaResult[];
  estimatedAllocation?: string;
  score: number;
  checkedAt: Date;
}

export interface CriteriaResult {
  type: string;
  requirement: string;
  met: boolean;
  value?: string | number;
  message?: string;
}

