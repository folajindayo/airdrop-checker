/**
 * DateTime Utilities Tests
 */

import { formatDate, getRelativeTime, isPast, isFuture } from '../../../src/core/utils/datetime';

describe('DateTime Utils', () => {
  describe('formatDate', () => {
    it('should format timestamp to date string', () => {
      const timestamp = new Date('2024-01-01').getTime();
      const result = formatDate(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time for recent timestamp', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const result = getRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    it('should return relative time for old timestamp', () => {
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const result = getRelativeTime(oneYearAgo);
      expect(result).toContain('year');
    });
  });

  describe('isPast', () => {
    it('should return true for past timestamp', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(isPast(yesterday)).toBe(true);
    });

    it('should return false for future timestamp', () => {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      expect(isPast(tomorrow)).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future timestamp', () => {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      expect(isFuture(tomorrow)).toBe(true);
    });

    it('should return false for past timestamp', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(isFuture(yesterday)).toBe(false);
    });
  });
});

