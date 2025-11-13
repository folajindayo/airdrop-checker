import { formatDate, getRelativeTime, isToday, addDays } from '@airdrop-finder/shared';

describe('Datetime Utils', () => {
  describe('formatDate', () => {
    it('should format timestamp to date string', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const formatted = formatDate(timestamp);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time for recent timestamps', () => {
      const oneHourAgo = Date.now() - 3600000;
      const result = getRelativeTime(oneHourAgo);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(Date.now())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = Date.now() - 86400000;
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to timestamp', () => {
      const now = Date.now();
      const future = addDays(now, 5);
      expect(future).toBeGreaterThan(now);
    });
  });
});

