/**
 * Wallet Repository Interface
 * Defines contract for wallet data access
 */

import { WalletEntity } from '../entities';

export interface WalletRepository {
  /**
   * Find wallet by address and chain
   */
  findByAddress(address: string, chainId: number): Promise<WalletEntity | null>;

  /**
   * Save wallet
   */
  save(wallet: WalletEntity): Promise<WalletEntity>;

  /**
   * Update wallet balance
   */
  updateBalance(address: string, chainId: number, balance: Partial<WalletEntity['balance']>): Promise<WalletEntity>;

  /**
   * Update transaction summary
   */
  updateTransactions(address: string, chainId: number, transactions: Partial<WalletEntity['transactions']>): Promise<WalletEntity>;

  /**
   * Get wallet eligibility score
   */
  getEligibilityScore(address: string): Promise<number>;

  /**
   * Check if wallet exists
   */
  exists(address: string, chainId: number): Promise<boolean>;

  /**
   * Delete wallet data
   */
  delete(address: string, chainId: number): Promise<boolean>;
}

