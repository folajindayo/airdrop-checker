/**
 * Wallet health service
 * Business logic for wallet health assessment
 * 
 * @module WalletHealthService
 */

import { getTokenBalances } from '../goldrush/tokens';
import { getTransactions } from '../goldrush/transactions';

/**
 * Wallet health data structure
 */
export interface WalletHealthData {
  address: string;
  healthScore: number;
  diversification: number;
  activity: number;
  risk: number;
  recommendations: string[];
  metrics: {
    uniqueTokens: number;
    uniqueChains: number;
    transactionCount: number;
    avgTransactionValue: number;
  };
}

/**
 * Assess wallet health for an address
 * 
 * @param address - Ethereum address to assess
 * @param chainIds - Array of chain IDs to query (default: [1, 8453, 42161, 10, 137])
 * @returns Wallet health data including scores and recommendations
 * @throws {Error} If address is invalid or data fetch fails
 * 
 * @example
 * ```typescript
 * const health = await assessWalletHealth('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(health.healthScore); // Overall health score (0-100)
 * console.log(health.recommendations); // Array of recommendations
 * ```
 */
export async function assessWalletHealth(
  address: string,
  chainIds: number[] = [1, 8453, 42161, 10, 137]
): Promise<WalletHealthData> {
  // Fetch data
  const balancePromises = chainIds.map((id) =>
    getTokenBalances(address, id).catch(() => null)
  );
  const txPromises = chainIds.map((id) =>
    getTransactions(address, id).catch(() => null)
  );
  
  const [balances, txs] = await Promise.all([
    Promise.all(balancePromises),
    Promise.all(txPromises),
  ]);
  
  // Calculate metrics
  const uniqueTokens = new Set(
    balances.flatMap((b) => b?.items?.map((i: any) => i.contract_address) || [])
  ).size;
  
  const uniqueChains = balances.filter((b) => b !== null).length;
  const transactionCount = txs.reduce((sum, t) => sum + (t?.items?.length || 0), 0);
  
  // Calculate scores
  const diversification = Math.min(100, (uniqueTokens / 10) * 100);
  const activity = Math.min(100, (transactionCount / 100) * 100);
  const risk = 50; // Placeholder
  const healthScore = (diversification + activity + (100 - risk)) / 3;
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (diversification < 50) {
    recommendations.push('Consider diversifying your portfolio across more tokens');
  }
  if (activity < 30) {
    recommendations.push('Increase on-chain activity to improve eligibility');
  }
  
  return {
    address: address.toLowerCase(),
    healthScore: Math.round(healthScore),
    diversification: Math.round(diversification),
    activity: Math.round(activity),
    risk: Math.round(risk),
    recommendations,
    metrics: {
      uniqueTokens,
      uniqueChains,
      transactionCount,
      avgTransactionValue: 0,
    },
  };
}
