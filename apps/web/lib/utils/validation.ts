/**
 * Validation Utilities
 * Common validation functions
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate ENS domain
 */
export function isValidENS(domain: string): boolean {
  return /^[a-z0-9-]+\.eth$/.test(domain.toLowerCase());
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate number range
 */
export function isInRange(
  num: number,
  min: number,
  max: number
): boolean {
  return num >= min && num <= max;
}

/**
 * Validate required fields in object
 */
export function hasRequiredFields<T extends object>(
  obj: T,
  fields: (keyof T)[]
): boolean {
  return fields.every((field) => {
    const value = obj[field];
    return value !== null && value !== undefined && value !== "";
  });
}
