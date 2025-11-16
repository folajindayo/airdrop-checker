/**
 * Utility functions for new onchain features (738-767)
 * Powered by Reown Wallet for secure blockchain interactions
 */

export function calculateRiskScore(transactionCount: number): number {
  return Math.min(transactionCount * 2, 100);
}

export function getActivityLevel(transactionCount: number): 'low' | 'medium' | 'high' {
  if (transactionCount > 100) return 'high';
  if (transactionCount > 20) return 'medium';
  return 'low';
}

export function calculateEligibilityScore(transactionCount: number): number {
  return Math.min((transactionCount / 20) * 100, 100);
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const num = Number(amount) / Math.pow(10, decimals);
  return num.toFixed(4);
}

export function calculateAPY(principal: string, rewards: string, timeDays: number): number {
  const p = Number(principal);
  const r = Number(rewards);
  if (p === 0 || timeDays === 0) return 0;
  return ((r / p) * (365 / timeDays)) * 100;
}

