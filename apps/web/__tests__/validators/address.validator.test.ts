/**
 * Tests for address validator
 */

import { validateAddress, normalizeAddress } from '@/lib/validators/address.validator';

describe('Address Validator', () => {
  describe('validateAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
      ];

      validAddresses.forEach((address) => {
        expect(validateAddress(address)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE', // too short
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // missing 0x
        '',
        'not-an-address',
      ];

      invalidAddresses.forEach((address) => {
        expect(validateAddress(address)).toBe(false);
      });
    });
  });

  describe('normalizeAddress', () => {
    it('should normalize address to lowercase', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const normalized = normalizeAddress(address);

      expect(normalized).toBe(address.toLowerCase());
    });

    it('should handle already lowercase addresses', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb';
      const normalized = normalizeAddress(address);

      expect(normalized).toBe(address);
    });
  });
});

