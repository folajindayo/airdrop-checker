/**
 * Extended tests for validation utilities
 */

import {
  isValidAddress,
  isValidTxHash,
  isValidChainId,
} from '@airdrop-finder/shared';

describe('Validation Utils - Extended', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
      ];

      validAddresses.forEach((address) => {
        expect(isValidAddress(address)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE', // too short
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // missing 0x
        '0xG42d35Cc6634C0532925a3b844Bc9e7595f0bEb', // invalid character
        '',
        'not-an-address',
      ];

      invalidAddresses.forEach((address) => {
        expect(isValidAddress(address)).toBe(false);
      });
    });

    it('should handle case-insensitive addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      expect(isValidAddress(address.toLowerCase())).toBe(true);
      expect(isValidAddress(address.toUpperCase())).toBe(true);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct transaction hashes', () => {
      const validHashes = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ];

      validHashes.forEach((hash) => {
        expect(isValidTxHash(hash)).toBe(true);
      });
    });

    it('should reject invalid transaction hashes', () => {
      const invalidHashes = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde', // too short
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // missing 0x
        '0xG234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // invalid char
        '',
      ];

      invalidHashes.forEach((hash) => {
        expect(isValidTxHash(hash)).toBe(false);
      });
    });
  });

  describe('isValidChainId', () => {
    it('should validate known chain IDs', () => {
      const validChainIds = [1, 8453, 42161, 10, 137];

      validChainIds.forEach((chainId) => {
        expect(isValidChainId(chainId)).toBe(true);
      });
    });

    it('should reject invalid chain IDs', () => {
      const invalidChainIds = [-1, 0, 999999, NaN, null as any, undefined as any];

      invalidChainIds.forEach((chainId) => {
        expect(isValidChainId(chainId)).toBe(false);
      });
    });
  });
});

