/**
 * Amount Formatter Tests
 */

import { formatAmount, formatCurrency, formatTokenAmount } from '../amount-formatter.util';

describe('AmountFormatter', () => {
  describe('formatAmount', () => {
    it('should format small amounts', () => {
      expect(formatAmount('123.45')).toBe('123.45');
    });

    it('should format large amounts with commas', () => {
      expect(formatAmount('1000000')).toBe('1,000,000');
    });

    it('should handle decimal places', () => {
      expect(formatAmount('123.456789', 2)).toBe('123.46');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toContain('1,234.56');
    });
  });

  describe('formatTokenAmount', () => {
    it('should format with token symbol', () => {
      expect(formatTokenAmount('100', 'ETH')).toBe('100 ETH');
    });
  });
});

