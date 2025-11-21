/**
 * Wallet Repository Interface
 * Defines the contract for wallet data persistence
 */

import { WalletEntity } from '../entities/wallet.entity';

export interface WalletFilters {
  chainId?: number;
  minBalance?: bigint;
  minTransactionCount?: number;
  hasNFT?: boolean;
  tags?: string[];
  isActive?: boolean;
}

export interface IWalletRepository {
  /**
   * Find wallet by address
   */
  findByAddress(address: string, chainId: number): Promise<WalletEntity | null>;

  /**
   * Find wallet by ENS name
   */
  findByENS(ens: string): Promise<WalletEntity | null>;

  /**
   * Find wallets with filters
   */
  find(filters: WalletFilters): Promise<WalletEntity[]>;

  /**
   * Create new wallet record
   */
  create(wallet: WalletEntity): Promise<WalletEntity>;

  /**
   * Update wallet record
   */
  update(address: string, chainId: number, wallet: WalletEntity): Promise<WalletEntity>;

  /**
   * Delete wallet record
   */
  delete(address: string, chainId: number): Promise<void>;

  /**
   * Update wallet balance
   */
  updateBalance(address: string, chainId: number, balance: bigint): Promise<void>;

  /**
   * Update wallet activity timestamp
   */
  updateLastActivity(address: string, chainId: number): Promise<void>;

  /**
   * Add tag to wallet
   */
  addTag(address: string, chainId: number, tag: string): Promise<void>;

  /**
   * Remove tag from wallet
   */
  removeTag(address: string, chainId: number, tag: string): Promise<void>;

  /**
   * Get wallet eligibility score
   */
  getEligibilityScore(address: string, chainId: number): Promise<number>;

  /**
   * Check if wallet exists
   */
  exists(address: string, chainId: number): Promise<boolean>;

  /**
   * Get wallet statistics
   */
  getStats(address: string, chainId: number): Promise<{
    totalValue: number;
    tokenCount: number;
    nftCount: number;
    transactionCount: number;
  }>;
}
