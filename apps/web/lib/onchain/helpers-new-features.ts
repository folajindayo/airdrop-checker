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

