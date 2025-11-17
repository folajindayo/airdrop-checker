/**
 * Transformer functions for latest onchain features (768-797)
 * Transform data between different formats
 */

export function transformToActivityScore(transactionCount: number): number {
  return Math.min((transactionCount / 10) * 100, 100);
}

export function transformToRetentionRate(activeHolders: number, totalHolders: number): number {
  if (totalHolders === 0) return 0;
  return (activeHolders / totalHolders) * 100;
}

export function transformToLiquidityScore(liquidity: string, minLiquidity: string): number {
  const liq = Number(liquidity);
  const min = Number(minLiquidity);
  if (min === 0) return 100;
  return Math.min((liq / min) * 100, 100);
}

export function transformToDistributionScore(concentration: number): number {
  return Math.max(0, 100 - concentration);
}

export function transformToPegStability(deviation: number): number {
  return Math.max(0, 100 - Math.abs(deviation) * 10);
}

export function transformToHolderHealth(distribution: number, retention: number, activity: number): number {
  return (distribution * 0.4 + retention * 0.4 + activity * 0.2);
}

export function transformToContractComplexity(bytecodeSize: number, functions: number): number {
  return Math.min((bytecodeSize / 1000 + functions / 10) * 10, 100);
}

export function transformToTimelockUrgency(delay: number, timeRemaining: number): 'low' | 'medium' | 'high' {
  const ratio = timeRemaining / delay;
  if (ratio < 0.1) return 'high';
  if (ratio < 0.5) return 'medium';
  return 'low';
}

export function transformToProxyRisk(isProxy: boolean, hasUpgrade: boolean, upgradeCount: number): number {
  if (!isProxy) return 0;
  let risk = 20;
  if (hasUpgrade) risk += 30;
  risk += Math.min(upgradeCount * 10, 50);
  return risk;
}

