/**
 * Validation utilities for onchain features
 * Validates inputs before sending to Reown Wallet
 */

import { isValidAddress } from './utils';
import { ONCHAIN_ERRORS } from './errors';

export function validateAddress(address: string): void {
  if (!address || !isValidAddress(address)) {
    throw ONCHAIN_ERRORS.INVALID_ADDRESS;
  }
}

export function validateChainId(chainId: number): void {
  const supportedChains = [1, 8453, 42161, 10, 137, 324];
  if (!supportedChains.includes(chainId)) {
    throw ONCHAIN_ERRORS.INVALID_CHAIN;
  }
}

export function validateAmount(amount: string): void {
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new Error('Invalid amount. Must be a positive number');
  }
}

export function validateTokenId(tokenId: string | number): void {
  const id = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
  if (isNaN(id) || id < 0) {
    throw new Error('Invalid token ID');
  }
}

export function validateProposalId(proposalId: number): void {
  if (!Number.isInteger(proposalId) || proposalId < 0) {
    throw new Error('Invalid proposal ID');
  }
}

export function validateVoteSupport(support: number): void {
  if (![0, 1, 2].includes(support)) {
    throw new Error('Support must be 0 (against), 1 (for), or 2 (abstain)');
  }
}

