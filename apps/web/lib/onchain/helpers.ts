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

