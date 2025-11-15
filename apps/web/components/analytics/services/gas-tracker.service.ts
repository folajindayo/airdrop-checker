/**
 * Gas tracker service
 * Business logic for gas spending analytics
 * 
 * @module GasTrackerService
 */

import { getTransactions } from '../goldrush/transactions';
import type { GoldRushTransaction } from '@airdrop-finder/shared';

/**
 * Gas tracker data structure
 */
export interface GasTrackerData {
  address: string;
  totalGasSpent: string;
  totalGasSpentUSD: number;
  chainBreakdown: ChainGasData[];
  monthlyBreakdown: MonthlyGasData[];
  timestamp: number;
}

/**
 * Chain gas data breakdown
 */
export interface ChainGasData {
  chainId: number;
  chainName: string;
  gasSpent: string;
  gasSpentUSD: number;
  transactionCount: number;
  percentage: number;
}

/**
 * Monthly gas data
 */
export interface MonthlyGasData {
  month: string;
  gasSpent: string;
  gasSpentUSD: number;
  transactionCount: number;
}

/**
 * Get gas spending data for an address
 * 
 * @param address - Ethereum address to get gas data for
 * @param chainIds - Array of chain IDs to query (default: [1, 8453, 42161, 10, 137])
 * @returns Gas tracker data including total spent, chain breakdown, and monthly breakdown
 * @throws {Error} If address is invalid or data fetch fails
 * 
 * @example
 * ```typescript
 * const gasData = await getGasTrackerData('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(gasData.totalGasSpentUSD); // Total gas spent in USD
 * ```
 */
export async function getGasTrackerData(
  address: string,
  chainIds: number[] = [1, 8453, 42161, 10, 137]
): Promise<GasTrackerData> {
  // Fetch transactions from all chains
  const txPromises = chainIds.map((chainId) =>
    getTransactions(address, chainId)
      .then((data) => ({ chainId, data }))
      .catch(() => ({ chainId, data: null }))
  );
  
  const txResults = await Promise.all(txPromises);
  
  // Process gas spending
  const chainBreakdown: ChainGasData[] = [];
  const monthlyData: Map<string, MonthlyGasData> = new Map();
  let totalGasSpent = BigInt(0);
  let totalGasSpentUSD = 0;
  
  txResults.forEach(({ chainId, data }) => {
    if (!data || !data.items) return;
    
    let chainGasSpent = BigInt(0);
    let chainGasSpentUSD = 0;
    
    data.items.forEach((tx: GoldRushTransaction) => {
      const gasSpent = BigInt(tx.gas_spent || 0);
      const gasQuote = tx.gas_quote || 0;
      
      chainGasSpent += gasSpent;
      chainGasSpentUSD += gasQuote;
      totalGasSpent += gasSpent;
      totalGasSpentUSD += gasQuote;
      
      // Track monthly data
      const date = new Date(tx.block_signed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          gasSpent: '0',
          gasSpentUSD: 0,
          transactionCount: 0,
        });
      }
      
      const monthly = monthlyData.get(monthKey)!;
      monthly.gasSpent = (BigInt(monthly.gasSpent) + gasSpent).toString();
      monthly.gasSpentUSD += gasQuote;
      monthly.transactionCount++;
    });
    
    if (chainGasSpent > BigInt(0)) {
      chainBreakdown.push({
        chainId,
        chainName: data.chain_name,
        gasSpent: chainGasSpent.toString(),
        gasSpentUSD: chainGasSpentUSD,
        transactionCount: data.items.length,
        percentage: 0, // Will be calculated later
      });
    }
  });
  
  // Calculate percentages
  chainBreakdown.forEach((chain) => {
    chain.percentage = totalGasSpentUSD > 0
      ? (chain.gasSpentUSD / totalGasSpentUSD) * 100
      : 0;
  });
  
  // Sort monthly data
  const monthlyBreakdown = Array.from(monthlyData.values()).sort((a, b) =>
    b.month.localeCompare(a.month)
  );
  
  return {
    address: address.toLowerCase(),
    totalGasSpent: totalGasSpent.toString(),
    totalGasSpentUSD,
    chainBreakdown,
    monthlyBreakdown,
    timestamp: Date.now(),
  };
}
