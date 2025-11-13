/**
 * Validation helper utilities
 * Provides common validation functions for API routes
 */

import { isValidAddress, isValidTxHash } from '@airdrop-finder/shared';
import { AppError, ErrorCode } from './error-handler';

/**
 * Validate Ethereum address or throw error
 */
export function validateAddressOrThrow(address: string): string {
  if (!address) {
    throw new AppError('Address is required', ErrorCode.VALIDATION_ERROR, 400);
  }

  if (!isValidAddress(address)) {
    throw new AppError('Invalid Ethereum address', ErrorCode.VALIDATION_ERROR, 400);
  }

  return address.toLowerCase();
}

/**
 * Validate transaction hash or throw error
 */
export function validateTxHashOrThrow(txHash: string): string {
  if (!txHash) {
    throw new AppError('Transaction hash is required', ErrorCode.VALIDATION_ERROR, 400);
  }

  if (!isValidTxHash(txHash)) {
    throw new AppError('Invalid transaction hash', ErrorCode.VALIDATION_ERROR, 400);
  }

  return txHash.toLowerCase();
}

/**
 * Validate required field or throw error
 */
export function validateRequiredOrThrow<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined || value === '') {
    throw new AppError(
      `${fieldName} is required`,
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  return value;
}

/**
 * Validate enum value or throw error
 */
export function validateEnumOrThrow<T>(
  value: T,
  allowedValues: T[],
  fieldName: string
): T {
  if (!allowedValues.includes(value)) {
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  return value;
}

/**
 * Validate number range or throw error
 */
export function validateRangeOrThrow(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min || value > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max}`,
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  return value;
}

