/**
 * Tests for validation helper utilities
 */

import {
  validateAddressOrThrow,
  validateTxHashOrThrow,
  validateRequiredOrThrow,
  validateEnumOrThrow,
  validateRangeOrThrow,
} from '@/lib/utils/validation-helpers';
import { AppError, ErrorCode } from '@/lib/utils/error-handler';

describe('Validation Helpers', () => {
  describe('validateAddressOrThrow', () => {
    it('should return normalized address for valid address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const result = validateAddressOrThrow(address);

      expect(result).toBe(address.toLowerCase());
    });

    it('should throw AppError for invalid address', () => {
      expect(() => validateAddressOrThrow('invalid')).toThrow(AppError);
    });

    it('should throw AppError for empty address', () => {
      expect(() => validateAddressOrThrow('')).toThrow(AppError);
    });
  });

  describe('validateTxHashOrThrow', () => {
    it('should return normalized hash for valid tx hash', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = validateTxHashOrThrow(hash);

      expect(result).toBe(hash.toLowerCase());
    });

    it('should throw AppError for invalid tx hash', () => {
      expect(() => validateTxHashOrThrow('invalid')).toThrow(AppError);
    });
  });

  describe('validateRequiredOrThrow', () => {
    it('should return value when present', () => {
      const result = validateRequiredOrThrow('value', 'field');
      expect(result).toBe('value');
    });

    it('should throw AppError for null', () => {
      expect(() => validateRequiredOrThrow(null, 'field')).toThrow(AppError);
    });

    it('should throw AppError for undefined', () => {
      expect(() => validateRequiredOrThrow(undefined, 'field')).toThrow(AppError);
    });

    it('should throw AppError for empty string', () => {
      expect(() => validateRequiredOrThrow('', 'field')).toThrow(AppError);
    });
  });

  describe('validateEnumOrThrow', () => {
    it('should return value when in allowed values', () => {
      const result = validateEnumOrThrow('confirmed', ['confirmed', 'rumored'], 'status');
      expect(result).toBe('confirmed');
    });

    it('should throw AppError for value not in enum', () => {
      expect(() => validateEnumOrThrow('invalid', ['confirmed', 'rumored'], 'status')).toThrow(AppError);
    });
  });

  describe('validateRangeOrThrow', () => {
    it('should return value when in range', () => {
      const result = validateRangeOrThrow(5, 0, 10, 'value');
      expect(result).toBe(5);
    });

    it('should throw AppError for value below min', () => {
      expect(() => validateRangeOrThrow(-1, 0, 10, 'value')).toThrow(AppError);
    });

    it('should throw AppError for value above max', () => {
      expect(() => validateRangeOrThrow(11, 0, 10, 'value')).toThrow(AppError);
    });
  });
});

