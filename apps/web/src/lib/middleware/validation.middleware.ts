/**
 * Validation middleware for API routes
 */

import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createValidationErrorResponse } from '../utils/response-handlers';

/**
 * Validate Ethereum address parameter
 */
export async function validateAddress(
  request: NextRequest,
  params: { address: string }
) {
  if (!params.address || !isValidAddress(params.address)) {
    return createValidationErrorResponse('Invalid Ethereum address');
  }
  return null; // No error
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: number, limit?: number) {
  if (page !== undefined && (page < 0 || !Number.isInteger(page))) {
    return createValidationErrorResponse('Page must be a non-negative integer');
  }
  if (limit !== undefined && (limit < 1 || limit > 100 || !Number.isInteger(limit))) {
    return createValidationErrorResponse('Limit must be between 1 and 100');
  }
  return null;
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: number) {
  const validChainIds = [1, 8453, 42161, 10, 137, 324];
  if (!validChainIds.includes(chainId)) {
    return createValidationErrorResponse(`Invalid chain ID. Supported: ${validChainIds.join(', ')}`);
  }
  return null;
}

