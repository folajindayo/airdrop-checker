/**
 * Validation Utilities Tests
 */

import { isValidAddress, isValidTxHash } from '../../../src/core/utils/validation';

describe('Validation Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct addresses', () => {
      expect(isValidAddress('0x' + '0'.repeat(40))).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct tx hashes', () => {
      expect(isValidTxHash('0x' + '0'.repeat(64))).toBe(true);
    });

    it('should reject invalid tx hashes', () => {
      expect(isValidTxHash('invalid')).toBe(false);
    });
  });
});

