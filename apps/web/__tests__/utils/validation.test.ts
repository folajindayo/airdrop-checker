/**
 * Tests for validation utilities
 */

import {
  isValidAddress,
  isValidTxHash,
  isValidEmail,
  isValidUrl,
  isValidChainId,
  isEmpty,
  isValidJSON,
  isInRange,
  matchesPattern,
  isNumeric,
  sanitizeString,
  normalizeAddress,
  validateAndNormalizeAddress,
  isPositive,
  isNonNegative,
  hasMinLength,
  hasMaxLength,
  hasMinItems,
  isValidDate,
  isDateInPast,
  isDateInFuture,
  hasRequiredKeys,
  removeNullish,
  deepClone,
  isEqual,
} from '@/lib/utils/validation';

describe('validation utils', () => {
  describe('isValidAddress', () => {
    it('should validate valid addresses', () => {
      expect(isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0beb0')).toBe(true);
      expect(isValidAddress('0xABCDEF1234567890123456789012345678901234')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('')).toBe(false);
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('742d35cc6634c0532925a3b844bc9e7595f0beb0')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate valid transaction hashes', () => {
      const validHash = '0x' + 'a'.repeat(64);
      expect(isValidTxHash(validHash)).toBe(true);
    });

    it('should reject invalid hashes', () => {
      expect(isValidTxHash('')).toBe(false);
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('invalid')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@sub.domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('//invalid')).toBe(false);
    });
  });

  describe('isValidChainId', () => {
    it('should validate valid chain IDs', () => {
      expect(isValidChainId(1)).toBe(true);
      expect(isValidChainId(137)).toBe(true);
      expect(isValidChainId(10000)).toBe(true);
    });

    it('should reject invalid chain IDs', () => {
      expect(isValidChainId(0)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
      expect(isValidChainId(1.5)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('isValidJSON', () => {
    it('should validate valid JSON', () => {
      expect(isValidJSON('{}')).toBe(true);
      expect(isValidJSON('[]')).toBe(true);
      expect(isValidJSON('{"key": "value"}')).toBe(true);
      expect(isValidJSON('"string"')).toBe(true);
      expect(isValidJSON('123')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(isValidJSON('')).toBe(false);
      expect(isValidJSON('invalid')).toBe(false);
      expect(isValidJSON('{key: value}')).toBe(false);
      expect(isValidJSON("{'key': 'value'}")).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should check if value is in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should detect values out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
      expect(isInRange(-5, 1, 10)).toBe(false);
    });
  });

  describe('matchesPattern', () => {
    it('should match patterns', () => {
      expect(matchesPattern('hello123', /^[a-z0-9]+$/)).toBe(true);
      expect(matchesPattern('test@example.com', /@/)).toBe(true);
    });

    it('should not match invalid patterns', () => {
      expect(matchesPattern('Hello123', /^[a-z0-9]+$/)).toBe(false);
      expect(matchesPattern('test', /@/)).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should validate numbers', () => {
      expect(isNumeric(123)).toBe(true);
      expect(isNumeric(123.45)).toBe(true);
      expect(isNumeric(-50)).toBe(true);
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('123.45')).toBe(true);
      expect(isNumeric('-50')).toBe(true);
    });

    it('should reject non-numeric values', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric(NaN)).toBe(false);
      expect(isNumeric(Infinity)).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<p>hello</p>')).toBe('hello');
      expect(sanitizeString('<script>alert("xss")</script>hello')).toBe('hello');
    });

    it('should remove multiple tags', () => {
      expect(sanitizeString('<div><p>hello</p></div>')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should handle plain text', () => {
      expect(sanitizeString('hello')).toBe('hello');
    });
  });

  describe('normalizeAddress', () => {
    it('should normalize to lowercase', () => {
      expect(normalizeAddress('0xABCDEF')).toBe('0xabcdef');
    });

    it('should add 0x prefix if missing', () => {
      expect(normalizeAddress('abcdef')).toBe('0xabcdef');
    });

    it('should trim whitespace', () => {
      expect(normalizeAddress('  0xabcdef  ')).toBe('0xabcdef');
    });

    it('should handle empty string', () => {
      expect(normalizeAddress('')).toBe('');
    });
  });

  describe('validateAndNormalizeAddress', () => {
    it('should validate and normalize valid address', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb0';
      expect(validateAndNormalizeAddress(address.toUpperCase())).toBe(address);
    });

    it('should return null for invalid address', () => {
      expect(validateAndNormalizeAddress('invalid')).toBeNull();
      expect(validateAndNormalizeAddress('0x123')).toBeNull();
    });
  });

  describe('isPositive', () => {
    it('should validate positive numbers', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(0.1)).toBe(true);
      expect(isPositive(1000)).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
      expect(isPositive(Infinity)).toBe(false);
      expect(isPositive(NaN)).toBe(false);
    });
  });

  describe('isNonNegative', () => {
    it('should validate non-negative numbers', () => {
      expect(isNonNegative(0)).toBe(true);
      expect(isNonNegative(1)).toBe(true);
      expect(isNonNegative(0.1)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(isNonNegative(-1)).toBe(false);
      expect(isNonNegative(-0.1)).toBe(false);
      expect(isNonNegative(Infinity)).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should check minimum length', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hello', 5)).toBe(true);
    });

    it('should reject strings below minimum', () => {
      expect(hasMinLength('hi', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
    });
  });

  describe('hasMaxLength', () => {
    it('should check maximum length', () => {
      expect(hasMaxLength('hello', 10)).toBe(true);
      expect(hasMaxLength('hello', 5)).toBe(true);
    });

    it('should reject strings above maximum', () => {
      expect(hasMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('hasMinItems', () => {
    it('should check minimum items', () => {
      expect(hasMinItems([1, 2, 3], 2)).toBe(true);
      expect(hasMinItems([1, 2, 3], 3)).toBe(true);
    });

    it('should reject arrays below minimum', () => {
      expect(hasMinItems([1], 2)).toBe(false);
      expect(hasMinItems([], 1)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2025-01-01')).toBe(true);
      expect(isValidDate(Date.now())).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });
  });

  describe('isDateInPast', () => {
    it('should detect past dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isDateInPast(yesterday)).toBe(true);
    });

    it('should reject future dates', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isDateInPast(tomorrow)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('should detect future dates', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isDateInFuture(tomorrow)).toBe(true);
    });

    it('should reject past dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isDateInFuture(yesterday)).toBe(false);
    });
  });

  describe('hasRequiredKeys', () => {
    it('should check required keys', () => {
      const obj = { name: 'John', age: 30, email: 'john@example.com' };
      expect(hasRequiredKeys(obj, ['name', 'age'])).toBe(true);
    });

    it('should reject missing keys', () => {
      const obj = { name: 'John' };
      expect(hasRequiredKeys(obj, ['name', 'age'])).toBe(false);
    });
  });

  describe('removeNullish', () => {
    it('should remove null and undefined values', () => {
      const obj = { a: 1, b: null, c: undefined, d: 'test' };
      const result = removeNullish(obj);
      expect(result).toEqual({ a: 1, d: 'test' });
    });

    it('should keep falsy non-nullish values', () => {
      const obj = { a: 0, b: false, c: '' };
      const result = removeNullish(obj);
      expect(result).toEqual({ a: 0, b: false, c: '' });
    });
  });

  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should clone dates', () => {
      const date = new Date();
      const cloned = deepClone(date);
      
      expect(cloned.getTime()).toBe(date.getTime());
      expect(cloned).not.toBe(date);
    });

    it('should handle primitives', () => {
      expect(deepClone(5)).toBe(5);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(null)).toBe(null);
    });
  });

  describe('isEqual', () => {
    it('should compare primitives', () => {
      expect(isEqual(5, 5)).toBe(true);
      expect(isEqual('test', 'test')).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(5, 6)).toBe(false);
    });

    it('should compare objects', () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should compare nested objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(isEqual(obj1, obj2)).toBe(true);
    });

    it('should compare arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2], [1, 3])).toBe(false);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });
  });
});
