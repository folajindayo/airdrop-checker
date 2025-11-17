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

export function calculateMarketCap(supply: string, price: string): string {
  const s = Number(supply);
  const p = Number(price);
  return (s * p).toString();
}

export function calculateVolumeChange(current: string, previous: string): number {
  const c = Number(current);
  const p = Number(previous);
  if (p === 0) return 0;
  return ((c - p) / p) * 100;
}

export function calculateRetentionRate(activeHolders: number, totalHolders: number): number {
  if (totalHolders === 0) return 0;
  return (activeHolders / totalHolders) * 100;
}

export function calculatePegDeviation(currentPrice: string, targetPrice: string): number {
  const current = Number(currentPrice);
  const target = Number(targetPrice);
  if (target === 0) return 0;
  return ((current - target) / target) * 100;
}

export function calculateTimelockDelay(queuedAt: Date, delaySeconds: number): Date {
  return new Date(queuedAt.getTime() + delaySeconds * 1000);
}

export function detectProxyPattern(bytecode: string): boolean {
  return bytecode.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
}

export function calculateContractComplexity(bytecodeSize: number, functionCount: number): number {
  return Math.min((bytecodeSize / 1000 + functionCount / 10) * 10, 100);
}

export function segmentHoldersByBalance(balance: string, totalSupply: string): 'whale' | 'dolphin' | 'fish' {
  const bal = Number(balance);
  const supply = Number(totalSupply);
  const percentage = (bal / supply) * 100;
  if (percentage > 1) return 'whale';
  if (percentage > 0.1) return 'dolphin';
  return 'fish';
}

