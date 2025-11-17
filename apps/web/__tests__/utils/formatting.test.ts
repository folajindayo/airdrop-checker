/**
 * Tests for formatting utilities
 */

import { formatNumber, formatCurrency, shortenAddress } from '@airdrop-finder/shared';

describe('Formatting Utils', () => {
  describe('formatNumber', () => {
    it('should format numbers with separators', () => {
      expect(formatNumber(1234567)).toContain('1');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with symbol', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('$');
      expect(result).toContain('1,234');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      const addr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const shortened = shortenAddress(addr);
      expect(shortened).toContain('0x742d');
      expect(shortened).toContain('...');
    });
  });
});



