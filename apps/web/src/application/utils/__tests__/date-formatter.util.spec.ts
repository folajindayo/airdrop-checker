/**
 * Date Formatter Tests
 */

import { formatDate, formatTimeAgo, formatDateRange } from '../date-formatter.util';

describe('DateFormatter', () => {
  describe('formatDate', () => {
    it('should format date to readable string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBeTruthy();
    });
  });

  describe('formatTimeAgo', () => {
    it('should return "just now" for recent dates', () => {
      const now = new Date();
      expect(formatTimeAgo(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatTimeAgo(fiveMinutesAgo)).toContain('minute');
    });
  });

  describe('formatDateRange', () => {
    it('should format date range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const result = formatDateRange(start, end);
      expect(result).toBeTruthy();
    });
  });
});

