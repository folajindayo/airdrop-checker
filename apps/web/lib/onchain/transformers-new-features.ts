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

