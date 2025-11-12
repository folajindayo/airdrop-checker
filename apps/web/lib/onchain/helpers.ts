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

