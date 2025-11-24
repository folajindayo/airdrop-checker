/**
 * Helper functions for new onchain features (738-767)
 * Simplifies common operations with Reown Wallet
 */

import { Address } from 'viem';

export function formatChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

export function isLayer2(chainId: number): boolean {
  return chainId !== 1;
}

export function calculateGasEstimate(complexity: 'simple' | 'medium' | 'complex'): bigint {
  const estimates = {
    simple: 21000n,
    medium: 50000n,
    complex: 100000n,
  };
  return estimates[complexity];
}

export function normalizeAddress(address: string): Address {
  return address.toLowerCase() as Address;
}

export function calculateSlippage(amount: string, slippagePercent: number): string {
  const num = Number(amount);
  return (num * (slippagePercent / 100)).toString();
}

export function calculateHolderGrowthRate(current: number, previous: number, days: number): number {
  if (previous === 0) return 0;
  const growth = ((current - previous) / previous) * 100;
  return growth / days;
}

export function calculateSupplyInflationRate(currentSupply: string, previousSupply: string): number {
  const current = Number(currentSupply);
  const previous = Number(previousSupply);
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function detectWhaleThreshold(totalSupply: string, thresholdPercent: number = 1): string {
  const supply = Number(totalSupply);
  return (supply * (thresholdPercent / 100)).toString();
}

export function calculateGovernanceParticipation(votes: number, proposals: number): number {
  if (proposals === 0) return 0;
  return (votes / proposals) * 100;
}

export function calculateBytecodeSimilarity(code1: string, code2: string): number {
  if (!code1 || !code2) return 0;
  if (code1 === code2) return 100;
  const len = Math.min(code1.length, code2.length);
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (code1[i] === code2[i]) matches++;
  }
  return (matches / len) * 100;
}

export function estimateDeploymentGas(bytecodeSize: number): bigint {
  return BigInt(21000 + bytecodeSize * 200);
}

export function calculateHolderQualityScore(distribution: number, retention: number, activity: number): number {
  return (distribution * 0.4 + retention * 0.4 + activity * 0.2);
}

export function detectSmartWalletPattern(bytecode: string): boolean {
  const patterns = ['0x5af43d82803e903d91602b57fd5bf3', '0x608060405234801561001057600080fd5b'];
  return patterns.some(pattern => bytecode.includes(pattern));
}

