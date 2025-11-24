/**
 * Blockchain Helper Tests
 */

import { isValidAddress, getChainName, shortenAddress } from '../blockchain.helper';

describe('Blockchain Helper', () => {
  describe('isValidAddress', () => {
    it('should validate correct Ethereum address', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(true);
    });

    it('should reject invalid address', () => {
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('0x123')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('getChainName', () => {
    it('should return correct chain names', () => {
      expect(getChainName(1)).toBe('Ethereum');
      expect(getChainName(137)).toBe('Polygon');
      expect(getChainName(56)).toBe('BNB Chain');
    });

    it('should return unknown for invalid chain ID', () => {
      expect(getChainName(99999)).toBe('Unknown');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten address correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      expect(shortenAddress(address)).toBe('0x742d...f0bEb');
    });

    it('should handle short addresses', () => {
      expect(shortenAddress('0x123')).toBe('0x123');
    });
  });
});


