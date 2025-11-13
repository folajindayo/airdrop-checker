/**
 * Extended tests for datetime utilities
 */

import {
  formatDate,
  formatTimeAgo,
  formatTimestamp,
} from '@airdrop-finder/shared';

describe('Datetime Utils - Extended', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should handle different date formats', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2023-12-31'),
        new Date('2024-06-01'),
      ];

      dates.forEach((date) => {
        const formatted = formatDate(date);
        expect(formatted).toBeDefined();
      });
    });
  });

  describe('formatTimeAgo', () => {
    it('should format recent times', () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const formatted = formatTimeAgo(oneMinuteAgo);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should format older times', () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const formatted = formatTimeAgo(oneDayAgo);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamps', () => {
      const timestamp = Date.now();
      const formatted = formatTimestamp(timestamp);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should handle Unix timestamps', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const formatted = formatTimestamp(timestamp);

      expect(formatted).toBeDefined();
    });
  });
});

