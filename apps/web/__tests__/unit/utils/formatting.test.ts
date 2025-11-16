/**
 * Formatting Utilities Tests
 */

import { formatNumber, shortenAddress } from '../../../src/core/utils/formatting';

describe('Formatting Utils', () => {
  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten addresses', () => {
      const address = '0x' + '1234567890'.repeat(4);
      const shortened = shortenAddress(address);
      expect(shortened).toContain('...');
      expect(shortened.length).toBeLessThan(address.length);
    });
  });
});

