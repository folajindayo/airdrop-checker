/**
 * Tests for validation utilities
 */

import { isValidAddress, isValidTxHash, isValidChainId } from '@airdrop-finder/shared';

describe('Validation Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(true);
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct transaction hashes', () => {
      const validHash = '0x' + '1'.repeat(64);
      expect(isValidTxHash(validHash)).toBe(true);
    });

    it('should reject invalid hashes', () => {
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('invalid')).toBe(false);
    });
  });

  describe('isValidChainId', () => {
    it('should validate supported chain IDs', () => {
      expect(isValidChainId(1)).toBe(true);
      expect(isValidChainId(137)).toBe(true);
    });

    it('should reject unsupported chain IDs', () => {
      expect(isValidChainId(999)).toBe(false);
      expect(isValidChainId(-1)).toBe(false);
    });
  });
});

