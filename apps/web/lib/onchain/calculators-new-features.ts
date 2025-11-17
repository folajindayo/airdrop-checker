/**
 * Calculator functions for latest onchain features (768-797)
 * Mathematical calculations for market and holder analytics
 */

export function calculateTransferVelocity(transfers: number, timeDays: number): number {
  if (timeDays === 0) return 0;
  return transfers / timeDays;
}

export function calculateHolderDiversity(uniqueHolders: number, totalTransactions: number): number {
  if (totalTransactions === 0) return 0;
  return (uniqueHolders / totalTransactions) * 100;
}

export function calculateLiquidityScore(totalLiquidity: string, minLiquidity: string): number {
  const total = Number(totalLiquidity);
  const min = Number(minLiquidity);
  if (min === 0) return 100;
  return Math.min((total / min) * 100, 100);
}

export function calculateDistributionScore(top10Percent: number, total: number): number {
  if (total === 0) return 0;
  const concentration = (top10Percent / total) * 100;
  return 100 - concentration;
}

export function calculateGasEfficiency(savedGas: string, totalGas: string): number {
  const saved = Number(savedGas);
  const total = Number(totalGas);
  if (total === 0) return 0;
  return (saved / total) * 100;
}

export function calculateHolderStabilityScore(churnRate: number, retentionRate: number): number {
  return (retentionRate - churnRate) * 100;
}

export function calculateContractInteractionFrequency(interactions: number, timeDays: number): number {
  if (timeDays === 0) return 0;
  return interactions / timeDays;
}

export function calculateDeploymentCostEstimate(bytecodeSize: number, gasPrice: string): string {
  const gas = 21000 + bytecodeSize * 200;
  const price = Number(gasPrice);
  return (gas * price).toString();
}

export function calculateHolderMomentumScore(growthRate: number, activityRate: number): number {
  return (growthRate * 0.6 + activityRate * 0.4);
}

