/**
 * Tests for formatting utilities
 */

import {
  formatNumber,
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  formatAddress,
  formatTxHash,
  formatRelativeTime,
  formatDate,
  formatFileSize,
  formatDuration,
  pluralize,
  truncate,
  capitalize,
  titleCase,
  camelToTitle,
} from '@/lib/utils/format';

describe('format utils', () => {
  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(123)).toBe('123');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('should format as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should handle custom decimals', () => {
      expect(formatCurrency(1234.567, 3)).toBe('$1,234.567');
      expect(formatCurrency(1000, 0)).toBe('$1,000');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format with K suffix', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(10000)).toBe('10.0K');
    });

    it('should format with M suffix', () => {
      expect(formatCompactNumber(2500000)).toBe('2.5M');
      expect(formatCompactNumber(1000000)).toBe('1.0M');
    });

    it('should format with B suffix', () => {
      expect(formatCompactNumber(1000000000)).toBe('1.0B');
      expect(formatCompactNumber(5500000000)).toBe('5.5B');
    });

    it('should not add suffix for small numbers', () => {
      expect(formatCompactNumber(500)).toBe('500');
    });

    it('should handle custom decimals', () => {
      expect(formatCompactNumber(1500, 2)).toBe('1.50K');
      expect(formatCompactNumber(1500, 0)).toBe('2K');
    });
  });

  describe('formatPercentage', () => {
    it('should format as percentage', () => {
      expect(formatPercentage(0.5)).toBe('50.00%');
      expect(formatPercentage(0.123)).toBe('12.30%');
      expect(formatPercentage(1)).toBe('100.00%');
    });

    it('should handle custom decimals', () => {
      expect(formatPercentage(0.123, 1)).toBe('12.3%');
      expect(formatPercentage(0.123, 0)).toBe('12%');
    });

    it('should handle values over 100%', () => {
      expect(formatPercentage(1.5)).toBe('150.00%');
    });
  });

  describe('formatAddress', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';

    it('should truncate address', () => {
      expect(formatAddress(address)).toBe('0x1234...5678');
    });

    it('should handle custom character counts', () => {
      expect(formatAddress(address, 8, 6)).toBe('0x123456...345678');
    });

    it('should return original if too short', () => {
      expect(formatAddress('0x123')).toBe('0x123');
    });

    it('should handle empty address', () => {
      expect(formatAddress('')).toBe('');
    });
  });

  describe('formatTxHash', () => {
    const hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    it('should truncate transaction hash', () => {
      expect(formatTxHash(hash)).toBe('0xabcd...7890');
    });

    it('should handle custom character count', () => {
      expect(formatTxHash(hash, 8)).toBe('0xabcdef12...34567890');
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date();

    it('should show "just now" for recent times', () => {
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('should show minutes ago', () => {
      const minutes = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(minutes)).toBe('5 minutes ago');
    });

    it('should show hours ago', () => {
      const hours = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(hours)).toBe('3 hours ago');
    });

    it('should show days ago', () => {
      const days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(days)).toBe('2 days ago');
    });

    it('should handle singular forms', () => {
      const oneMinute = new Date(now.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinute)).toBe('1 minute ago');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-01-15T14:30:00');

    it('should format date without time', () => {
      const result = formatDate(testDate);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('should format date with time', () => {
      const result = formatDate(testDate, true);
      expect(result).toContain('Jan');
      expect(result).toContain('2:30');
    });

    it('should handle string dates', () => {
      const result = formatDate('2025-01-15');
      expect(result).toBeTruthy();
    });

    it('should handle unix timestamps', () => {
      const result = formatDate(Date.now());
      expect(result).toBeTruthy();
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500.00 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(5120)).toBe('5.00 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });

    it('should handle custom decimals', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(65000)).toBe('1m 5s');
    });

    it('should format minutes', () => {
      expect(formatDuration(180000)).toBe('3m 0s');
    });

    it('should format hours', () => {
      expect(formatDuration(3665000)).toBe('1h 1m');
    });

    it('should format days', () => {
      expect(formatDuration(90000000)).toBe('1d 1h');
    });
  });

  describe('pluralize', () => {
    it('should use singular for 1', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
    });

    it('should use plural for multiple', () => {
      expect(pluralize(5, 'item')).toBe('5 items');
      expect(pluralize(0, 'item')).toBe('0 items');
    });

    it('should handle custom plural form', () => {
      expect(pluralize(2, 'child', 'children')).toBe('2 children');
      expect(pluralize(1, 'child', 'children')).toBe('1 child');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('This is a long text', 10)).toBe('This is a...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncate('Exactly10!', 10)).toBe('Exactly10!');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('titleCase', () => {
    it('should convert to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('should handle already title case', () => {
      expect(titleCase('Hello World')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });
  });

  describe('camelToTitle', () => {
    it('should convert camelCase to Title Case', () => {
      expect(camelToTitle('helloWorld')).toBe('Hello World');
      expect(camelToTitle('myVariableName')).toBe('My Variable Name');
    });

    it('should handle single word', () => {
      expect(camelToTitle('hello')).toBe('Hello');
    });

    it('should handle PascalCase', () => {
      expect(camelToTitle('HelloWorld')).toBe('Hello World');
    });
  });
});

