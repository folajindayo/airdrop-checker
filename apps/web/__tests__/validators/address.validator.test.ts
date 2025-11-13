/**
 * Tests for address validator
 */

import {
  validateEthereumAddress,
  validateTransactionHash,
  validateMultipleAddresses,
} from '@/lib/validators/address.validator';

describe('Address Validator', () => {
  describe('validateEthereumAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
      ];

      validAddresses.forEach((address) => {
        const result = validateEthereumAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe(address.toLowerCase());
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
        const result = validateEthereumAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should return error for empty address', () => {
      const result = validateEthereumAddress('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Address is required');
    });
  });

  describe('validateTransactionHash', () => {
    it('should validate correct transaction hashes', () => {
      const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const result = validateTransactionHash(validHash);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe(validHash.toLowerCase());
    });

    it('should reject invalid transaction hashes', () => {
      const invalidHash = '0x123';
      const result = validateTransactionHash(invalidHash);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateMultipleAddresses', () => {
    it('should validate multiple addresses', () => {
      const addresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
        'invalid',
      ];

      const result = validateMultipleAddresses(addresses);

      expect(result.valid.length).toBe(2);
      expect(result.invalid.length).toBe(1);
      expect(result.errors).toHaveProperty('invalid');
    });
  });
});

