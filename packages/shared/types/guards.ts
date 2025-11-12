/**
 * Type guards for runtime validation
 * Provides safe type checking for external data
 */

import type { AirdropStatus, AirdropProject, CheckResult } from './index';
import type { ApiResponse, ApiError } from './api';

/**
 * Check if value is a valid airdrop status
 */
export function isAirdropStatus(value: unknown): value is AirdropStatus {
  return (
    typeof value === 'string' &&
    ['confirmed', 'rumored', 'expired', 'speculative'].includes(value)
  );
}

/**
 * Check if value is a valid airdrop project
 */
export function isAirdropProject(value: unknown): value is AirdropProject {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    isAirdropStatus(obj.status) &&
    Array.isArray(obj.criteria) &&
    obj.criteria.every(isEligibilityCriteria)
  );
}

/**
 * Check if value is valid eligibility criteria
 */
export function isEligibilityCriteria(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.description === 'string' &&
    typeof obj.check === 'string'
  );
}

/**
 * Check if value is a valid check result
 */
export function isCheckResult(value: unknown): value is CheckResult {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.address === 'string' &&
    typeof obj.overallScore === 'number' &&
    Array.isArray(obj.airdrops) &&
    typeof obj.timestamp === 'number'
  );
}

/**
 * Check if value is a valid API response
 */
export function isApiResponse<T>(
  value: unknown,
  dataValidator?: (data: unknown) => data is T
): value is ApiResponse<T> {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  if (typeof obj.success !== 'boolean') return false;
  
  // If success is true, data should exist and pass validator
  if (obj.success) {
    if (obj.data === undefined) return false;
    if (dataValidator && !dataValidator(obj.data)) return false;
  }
  
  // If success is false, error should exist
  if (!obj.success) {
    if (!obj.error || !isApiError(obj.error)) return false;
  }
  
  return true;
}

/**
 * Check if value is a valid API error
 */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  );
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is an array
 */
export function isArray<T>(
  value: unknown,
  itemValidator?: (item: unknown) => item is T
): value is T[] {
  if (!Array.isArray(value)) return false;
  
  if (itemValidator) {
    return value.every(itemValidator);
  }
  
  return true;
}

/**
 * Check if value is a record/object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is a valid date string or Date object
 */
export function isValidDate(value: unknown): value is Date | string {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
}

/**
 * Check if value is a valid Ethereum address
 */
export function isEthereumAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

/**
 * Check if value is a valid transaction hash
 */
export function isTransactionHash(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

/**
 * Assert that value passes type guard, throw if not
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage?: string
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(errorMessage || 'Type assertion failed');
  }
}

/**
 * Safely parse JSON with type validation
 */
export function parseJSON<T>(
  json: string,
  validator?: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    
    if (validator && !validator(parsed)) {
      return null;
    }
    
    return parsed as T;
  } catch {
    return null;
  }
}

