/**
 * Extended tests for formatting utilities
 */

import {
  formatNumber,
  formatCurrency,
  shortenAddress,
  formatPercentage,
} from '@airdrop-finder/shared';

describe('Formatting Utils - Extended', () => {
  describe('formatNumber', () => {
    it('should format large numbers with separators', () => {
      expect(formatNumber(1234567)).toContain('1,234,567');
      expect(formatNumber(1000000)).toContain('1,000,000');
    });

    it('should format small numbers without separators', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1234);
      expect(result).toContain('-');
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toContain('1,234');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with dollar sign', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('$');
      expect(result).toContain('1,234');
    });

    it('should format large currency amounts', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('$');
      expect(result).toContain('1,000,000');
    });

    it('should handle zero currency', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      const addr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const shortened = shortenAddress(addr);

      expect(shortened).toContain('0x742d');
      expect(shortened).toContain('...');
      expect(shortened).toContain('f0bEb');
    });

    it('should handle short addresses', () => {
      const addr = '0x742d';
      const shortened = shortenAddress(addr);
      expect(shortened).toBe(addr);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      const result = formatPercentage(75.5);
      expect(result).toContain('%');
      expect(result).toContain('75');
    });

    it('should handle zero percentage', () => {
      const result = formatPercentage(0);
      expect(result).toContain('0');
      expect(result).toContain('%');
    });

    it('should handle 100 percentage', () => {
      const result = formatPercentage(100);
      expect(result).toContain('100');
      expect(result).toContain('%');
    });
  });
});

