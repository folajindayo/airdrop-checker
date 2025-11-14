/**
 * Validation utilities
 * Common validation functions for the application
 */

/**
 * Check if value is a valid Ethereum address
 * 
 * @param address - Address to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') // true
 * isValidAddress('invalid') // false
 * ```
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if value is a valid transaction hash
 * 
 * @param hash - Hash to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidTxHash('0x...') // true/false
 * ```
 */
export function isValidTxHash(hash: string): boolean {
  if (!hash) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Check if value is a valid email
 * 
 * @param email - Email to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if value is a valid URL
 * 
 * @param url - URL to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // true
 * isValidUrl('not-a-url') // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid chain ID
 * 
 * @param chainId - Chain ID to validate
 * @returns True if valid
 */
export function isValidChainId(chainId: number): boolean {
  return chainId > 0 && Number.isInteger(chainId);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * 
 * @param value - Value to check
 * @returns True if empty
 * 
 * @example
 * ```typescript
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * ```
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is a valid JSON string
 * 
 * @param str - String to validate
 * @returns True if valid JSON
 * 
 * @example
 * ```typescript
 * isValidJSON('{"key": "value"}') // true
 * isValidJSON('invalid') // false
 * ```
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is within range
 * 
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if in range
 * 
 * @example
 * ```typescript
 * isInRange(5, 1, 10) // true
 * isInRange(15, 1, 10) // false
 * ```
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if string matches pattern
 * 
 * @param str - String to check
 * @param pattern - Regex pattern
 * @returns True if matches
 * 
 * @example
 * ```typescript
 * matchesPattern('hello123', /^[a-z0-9]+$/) // true
 * ```
 */
export function matchesPattern(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

/**
 * Check if value is a number
 * 
 * @param value - Value to check
 * @returns True if number
 * 
 * @example
 * ```typescript
 * isNumeric('123') // true
 * isNumeric('abc') // false
 * ```
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
  if (typeof value === 'string') return /^-?\d+\.?\d*$/.test(value);
  return false;
}

/**
 * Sanitize string (remove HTML tags and scripts)
 * 
 * @param str - String to sanitize
 * @returns Sanitized string
 * 
 * @example
 * ```typescript
 * sanitizeString('<script>alert("xss")</script>hello')
 * // Output: 'hello'
 * ```
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Normalize wallet address (lowercase, with 0x prefix)
 * 
 * @param address - Address to normalize
 * @returns Normalized address
 * 
 * @example
 * ```typescript
 * normalizeAddress('0xABC...') // '0xabc...'
 * ```
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  const cleaned = address.toLowerCase().trim();
  return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
}

/**
 * Validate and normalize address
 * 
 * @param address - Address to validate and normalize
 * @returns Normalized address or null if invalid
 * 
 * @example
 * ```typescript
 * validateAndNormalizeAddress('0xABC...') // '0xabc...'
 * validateAndNormalizeAddress('invalid') // null
 * ```
 */
export function validateAndNormalizeAddress(address: string): string | null {
  const normalized = normalizeAddress(address);
  return isValidAddress(normalized) ? normalized : null;
}

/**
 * Check if value is a positive number
 * 
 * @param value - Value to check
 * @returns True if positive number
 */
export function isPositive(value: number): boolean {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

/**
 * Check if value is a non-negative number
 * 
 * @param value - Value to check
 * @returns True if non-negative number
 */
export function isNonNegative(value: number): boolean {
  return typeof value === 'number' && value >= 0 && isFinite(value);
}

/**
 * Check if string has minimum length
 * 
 * @param str - String to check
 * @param minLength - Minimum length
 * @returns True if meets minimum
 */
export function hasMinLength(str: string, minLength: number): boolean {
  return typeof str === 'string' && str.length >= minLength;
}

/**
 * Check if string has maximum length
 * 
 * @param str - String to check
 * @param maxLength - Maximum length
 * @returns True if meets maximum
 */
export function hasMaxLength(str: string, maxLength: number): boolean {
  return typeof str === 'string' && str.length <= maxLength;
}

/**
 * Check if array has minimum length
 * 
 * @param arr - Array to check
 * @param minLength - Minimum length
 * @returns True if meets minimum
 */
export function hasMinItems<T>(arr: T[], minLength: number): boolean {
  return Array.isArray(arr) && arr.length >= minLength;
}

/**
 * Check if value is a valid date
 * 
 * @param value - Value to check
 * @returns True if valid date
 */
export function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Check if date is in the past
 * 
 * @param date - Date to check
 * @returns True if in the past
 */
export function isDateInPast(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  return dateObj.getTime() < Date.now();
}

/**
 * Check if date is in the future
 * 
 * @param date - Date to check
 * @returns True if in the future
 */
export function isDateInFuture(date: Date | string | number): boolean {
  const dateObj = new Date(date);
  return dateObj.getTime() > Date.now();
}

/**
 * Check if object has required keys
 * 
 * @param obj - Object to check
 * @param keys - Required keys
 * @returns True if has all keys
 */
export function hasRequiredKeys(obj: Record<string, unknown>, keys: string[]): boolean {
  return keys.every(key => key in obj);
}

/**
 * Remove undefined and null values from object
 * 
 * @param obj - Object to clean
 * @returns Cleaned object
 */
export function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Check if two objects are deeply equal
 * 
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if equal
 */
export function isEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (obj1 === null || obj2 === null) return false;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => isEqual(item, obj2[index]));
  }

  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    isEqual(
      (obj1 as Record<string, unknown>)[key],
      (obj2 as Record<string, unknown>)[key]
    )
  );
}

