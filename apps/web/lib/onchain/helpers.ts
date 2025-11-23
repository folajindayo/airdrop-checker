/**
 * Helper functions for onchain operations
 * Simplifies common operations with Reown Wallet
 */

import { Address } from 'viem';
import { getExplorerUrl, formatAddress } from './utils';

export function getTransactionExplorerUrl(chainId: number, txHash: string): string {
  return getExplorerUrl(chainId, 'tx', txHash);
}

export function getAddressExplorerUrl(chainId: number, address: Address): string {
  return getExplorerUrl(chainId, 'address', address);
}

export function formatTransactionHash(hash: string, chars = 8): string {
  return formatAddress(hash as Address, chars);
}

export function formatTokenAmount(amount: string, decimals: number = 18, precision: number = 4): string {
  const num = parseFloat(amount);
  const divisor = Math.pow(10, decimals);
  const formatted = (num / divisor).toFixed(precision);
  return parseFloat(formatted).toString();
}

export function calculateGasCost(gasLimit: bigint, gasPrice: bigint): bigint {
  return gasLimit * gasPrice;
}

export function formatGasCost(gasCost: bigint): string {
  const eth = Number(gasCost) / 1e18;
  return `${eth.toFixed(6)} ETH`;
}

export function isUnlimitedApproval(allowance: bigint): boolean {
  const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  return allowance >= maxUint256 - BigInt(1000); // Allow small margin for rounding
}

// Feature 1: Cross-chain token balance aggregator helpers
import type { ChainBalance } from './types';

export function aggregateCrossChainBalances(balances: ChainBalance[]): string {
  return balances.reduce((total, balance) => {
    const balanceBigInt = BigInt(balance.balance);
    return (BigInt(total) + balanceBigInt).toString();
  }, '0');
}

export function formatAggregatedBalance(totalBalance: string, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const balanceBigInt = BigInt(totalBalance);
  const formatted = Number(balanceBigInt) / Number(divisor);
  return formatted.toFixed(6);
}

export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
    324: 'zkSync',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

// Feature 2: MEV protection analyzer helpers
import type { MEVProtectionAnalysis } from './types';

export function calculateMEVRiskScore(
  gasPricePremium: number,
  hasPrivatePool: boolean,
  hasFlashbots: boolean
): number {
  let riskScore = 0;
  
  // Gas price premium contributes to risk
  if (gasPricePremium > 0.5) riskScore += 40;
  else if (gasPricePremium > 0.2) riskScore += 20;
  else if (gasPricePremium > 0.1) riskScore += 10;
  
  // Protection mechanisms reduce risk
  if (hasPrivatePool) riskScore -= 30;
  if (hasFlashbots) riskScore -= 20;
  
  return Math.max(0, Math.min(100, riskScore));
}

export function determineProtectionLevel(riskScore: number): 'none' | 'low' | 'medium' | 'high' {
  if (riskScore >= 70) return 'none';
  if (riskScore >= 40) return 'low';
  if (riskScore >= 20) return 'medium';
  return 'high';
}

export function generateMEVRecommendations(riskScore: number, hasProtection: boolean): string[] {
  const recommendations: string[] = [];
  
  if (riskScore > 50) {
    recommendations.push('Consider using private transaction pools');
    recommendations.push('Use Flashbots protection for sensitive transactions');
  }
  
  if (riskScore > 30) {
    recommendations.push('Increase gas price to reduce frontrunning risk');
    recommendations.push('Consider batching transactions');
  }
  
  if (!hasProtection && riskScore > 20) {
    recommendations.push('Enable MEV protection in your wallet settings');
  }
  
  return recommendations;
}

// Feature 3: Rug pull detector helpers
import type { RugPullAnalysis } from './types';

export function calculateRugPullRiskScore(riskFactors: RugPullAnalysis['riskFactors']): number {
  let score = 0;
  
  if (!riskFactors.liquidityLocked) score += 30;
  if (!riskFactors.ownershipRenounced) score += 25;
  if (!riskFactors.contractVerified) score += 20;
  if (riskFactors.hasTax) score += 10;
  if (riskFactors.highOwnership) score += 10;
  if (riskFactors.suspiciousActivity) score += 15;
  
  return Math.min(100, score);
}

export function determineRugPullRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (riskScore >= 70) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
}

// Feature 5: Gas optimization helpers
import type { GasOptimization } from './types';

export function calculateGasSavings(currentGas: number, optimizedGas: number): number {
  return currentGas - optimizedGas;
}

export function determineOptimizationPriority(savings: number, currentGas: number): 'low' | 'medium' | 'high' {
  const percentage = (savings / currentGas) * 100;
  if (percentage > 20) return 'high';
  if (percentage > 10) return 'medium';
  return 'low';
}

// Feature 31: Wash trading detector helpers
export function calculateWashTradingScore(suspiciousCount: number, totalTransactions: number): number {
  if (totalTransactions === 0) return 0;
  const ratio = suspiciousCount / totalTransactions;
  return Math.min(100, ratio * 100);
}

export function detectWashTradingPattern(from: string, to: string, amount: string, history: any[]): boolean {
  // Check if same addresses trade back and forth
  const reverseTrade = history.find(tx => 
    tx.from === to && tx.to === from && tx.amount === amount
  );
  return !!reverseTrade;
}

// Feature 33: LP reward calculator helpers
export function calculateAPY(totalRewards: bigint, stakedAmount: bigint, days: number): number {
  if (stakedAmount === BigInt(0) || days === 0) return 0;
  const annualRewards = (totalRewards * BigInt(365)) / BigInt(days);
  return Number((annualRewards * BigInt(10000)) / stakedAmount) / 100;
}

export function calculateDailyRewards(totalRewards: bigint, days: number): string {
  if (days === 0) return '0';
  return (totalRewards / BigInt(days)).toString();
}

// Feature 35: Tokenomics validator helpers
export function calculateTokenomicsScore(issues: any[]): number {
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'high') score -= 20;
    else if (issue.severity === 'medium') score -= 10;
    else score -= 5;
  });
  return Math.max(0, score);
}

// Feature 41: Transaction pattern analyzer helpers
export function classifyTransactionPattern(characteristics: string[]): 'regular' | 'bot' | 'whale' | 'arbitrage' | 'frontrunning' {
  if (characteristics.includes('high_frequency')) return 'bot';
  if (characteristics.includes('large_amount')) return 'whale';
  if (characteristics.includes('cross_dex')) return 'arbitrage';
  if (characteristics.includes('gas_premium')) return 'frontrunning';
  return 'regular';
}

export function calculateBehaviorScore(patterns: any[]): number {
  const riskPatterns = patterns.filter(p => 
    p.type === 'bot' || p.type === 'frontrunning'
  ).length;
  return Math.max(0, 100 - (riskPatterns * 20));
}

// Feature 43: Holder retention calculator helpers
export function calculateRetentionRate(newHolders: number, lostHolders: number, totalHolders: number): number {
  if (totalHolders === 0) return 0;
  const netChange = newHolders - lostHolders;
  return ((totalHolders + netChange) / totalHolders) * 100;
}

// Feature 45: Price manipulation detector helpers
export function calculateManipulationScore(suspiciousEvents: any[]): number {
  let score = 0;
  suspiciousEvents.forEach(event => {
    if (event.type === 'pump' || event.type === 'dump') score += 30;
    if (event.type === 'wash') score += 20;
  });
  return Math.min(100, score);
}

// Feature 49: Transfer velocity calculator helpers
export function calculateTransferVelocity(transferCount: number, timeRange: number, averageSize: bigint): number {
  if (timeRange === 0) return 0;
  const dailyTransfers = (transferCount / timeRange) * 86400;
  return Number(averageSize) * dailyTransfers;
}

// Feature 61: Holder concentration calculator
export function calculateConcentrationIndex(topHoldersPercentage: number): number {
  return topHoldersPercentage / 100;
}

export function determineConcentrationRisk(concentrationIndex: number): 'low' | 'medium' | 'high' | 'critical' {
  if (concentrationIndex > 0.7) return 'critical';
  if (concentrationIndex > 0.5) return 'high';
  if (concentrationIndex > 0.3) return 'medium';
  return 'low';
}

// Feature 73: Gini coefficient calculator
export function calculateGiniCoefficient(balances: bigint[]): number {
  if (balances.length === 0) return 0;
  
  const sorted = [...balances].sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, BigInt(0));
  if (sum === BigInt(0)) return 0;
  
  let numerator = BigInt(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const diff = sorted[i] > sorted[j] ? sorted[i] - sorted[j] : sorted[j] - sorted[i];
      numerator += diff;
    }
  }
  
  const denominator = BigInt(2) * BigInt(n) * BigInt(n) * sum / BigInt(n);
  return Number(numerator) / Number(denominator);
}

export function interpretGiniCoefficient(gini: number): 'equal' | 'moderate' | 'unequal' | 'extreme' {
  if (gini < 0.3) return 'equal';
  if (gini < 0.5) return 'moderate';
  if (gini < 0.7) return 'unequal';
  return 'extreme';
}

// Feature 76: Gas breakdown calculator
export function calculateGasBreakdown(totalGas: number) {
  return {
    base: Math.floor(totalGas * 0.21),
    storage: Math.floor(totalGas * 0.35),
    computation: Math.floor(totalGas * 0.30),
    external: Math.floor(totalGas * 0.14),
  };
}

// Feature 85: PnL calculator
export function calculatePnL(invested: bigint, currentValue: bigint): { profitLoss: string; percentage: number } {
  const profitLoss = currentValue - invested;
  const percentage = invested > BigInt(0) 
    ? Number((profitLoss * BigInt(10000)) / invested) / 100 
    : 0;
  return {
    profitLoss: profitLoss.toString(),
    percentage,
  };
}

