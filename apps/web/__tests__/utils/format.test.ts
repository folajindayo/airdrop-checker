/**
 * Format Utilities Tests
 */

import { formatAddress, formatBalance } from '../../lib/utils/consolidated/format.utils';

describe('formatAddress', () => {
  it('should shorten ethereum address', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = formatAddress(address);
    expect(result).toBe('0x1234...7890');
  });

  it('should return empty string for invalid address', () => {
    expect(formatAddress('')).toBe('');
  });
});

describe('formatBalance', () => {
  it('should format large numbers with K suffix', () => {
    expect(formatBalance(5000)).toBe('5.00K');
  });

  it('should format millions with M suffix', () => {
    expect(formatBalance(1500000)).toBe('1.50M');
  });
});
