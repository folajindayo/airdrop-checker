/**
 * Validation utilities for common data types
 * Provides reusable validation functions across the application
 * @module core/utils/validation
 */

/**
 * Check if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: unknown): address is string {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if a string is a valid transaction hash
 * @param hash - The hash to validate
 * @returns True if valid transaction hash
 */
export function isValidTxHash(hash: unknown): hash is string {
  if (typeof hash !== 'string') return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Check if a string is a valid email address
 * @param email - The email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value is a positive integer
 * @param value - The value to validate
 * @returns True if positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0
  );
}

/**
 * Check if a value is a non-negative integer
 * @param value - The value to validate
 * @returns True if non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0
  );
}

/**
 * Check if a string is within length bounds
 * @param str - The string to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if within bounds
 */
export function isStringLength(
  str: unknown,
  min: number,
  max: number
): str is string {
  if (typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
}

/**
 * Check if a number is within range
 * @param num - The number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range
 */
export function isNumberInRange(
  num: unknown,
  min: number,
  max: number
): num is number {
  if (typeof num !== 'number') return false;
  return num >= min && num <= max;
}

/**
 * Check if a value is one of allowed values
 * @param value - The value to check
 * @param allowed - Array of allowed values
 * @returns True if value is in allowed array
 */
export function isOneOf<T>(value: unknown, allowed: T[]): value is T {
  return allowed.includes(value as T);
}

/**
 * Check if all values in array are unique
 * @param arr - The array to check
 * @returns True if all values are unique
 */
export function hasUniqueValues<T>(arr: T[]): boolean {
  return new Set(arr).size === arr.length;
}

/**
 * Check if object has required keys
 * @param obj - The object to check
 * @param keys - Required keys
 * @returns True if all keys exist
 */
export function hasRequiredKeys(
  obj: unknown,
  keys: string[]
): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  return keys.every((key) => key in obj);
}

/**
 * Normalize Ethereum address to lowercase
 * @param address - The address to normalize
 * @returns Normalized address or null if invalid
 */
export function normalizeAddress(address: string): string | null {
  if (!isValidAddress(address)) return null;
  return address.toLowerCase();
}

/**
 * Sanitize string by removing special characters
 * @param str - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>'"]/g, '');
}

/**
 * Validate and parse integer from string
 * @param value - The value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default
 */
export function parseInteger(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : defaultValue;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Validate and parse float from string
 * @param value - The value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed float or default
 */
export function parseFloatSafe(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Validate and parse boolean from various input types
 * @param value - The value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed boolean or default
 */
export function parseBoolean(
  value: unknown,
  defaultValue: boolean = false
): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return defaultValue;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param value - The value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Validate chain ID
 * @param chainId - The chain ID to validate
 * @returns True if valid chain ID
 */
export function isValidChainId(chainId: unknown): chainId is number {
  if (typeof chainId !== 'number') return false;
  const validChainIds = [1, 10, 56, 137, 250, 324, 8453, 42161, 43114];
  return validChainIds.includes(chainId);
}

/**
 * Check if value is null or undefined
 * @param value - The value to check
 * @returns True if null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is a valid number (not NaN or Infinity)
 * @param value - The value to check
 * @returns True if valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validate ENS name format
 * @param name - ENS name to validate
 * @returns True if valid ENS name
 */
export function isValidENS(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  return /^[a-z0-9-]+\.eth$/.test(name.toLowerCase());
}

