/**
 * BigInt Utilities Tests
 */

import { formatBigInt, parseToBigInt } from '../../lib/utils/consolidated/bigint.utils';

describe('BigInt Utilities', () => {
  describe('formatBigInt', () => {
    it('formats bigint with 18 decimals', () => {
      const value = BigInt('1234567890000000000');
      expect(formatBigInt(value, 18)).toBe('1.23456789');
    });

    it('formats whole numbers', () => {
      const value = BigInt('5000000000000000000');
      expect(formatBigInt(value, 18)).toBe('5');
    });

    it('handles small values', () => {
      const value = BigInt('100000000000000');
      expect(formatBigInt(value, 18)).toBe('0.0001');
    });
  });

  describe('parseToBigInt', () => {
    it('parses decimal string', () => {
      const result = parseToBigInt('1.5', 18);
      expect(result).toBe(BigInt('1500000000000000000'));
    });

    it('parses whole numbers', () => {
      const result = parseToBigInt('10', 18);
      expect(result).toBe(BigInt('10000000000000000000'));
    });
  });
});

