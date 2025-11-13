/**
 * Wallet health service
 */

import { getTokenBalances } from '../goldrush/tokens';
import { getTransactions } from '../goldrush/transactions';

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

