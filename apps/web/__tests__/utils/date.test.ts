/**
 * Tests for date utilities
 */

import {
  formatDate,
  toISOString,
  parseDate,
  getRelativeTime,
  getTimeUntil,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  diffInDays,
  diffInHours,
  diffInMinutes,
  isBetween,
  getDayName,
  getMonthName,
  getQuarter,
  isLeapYear,
  getDaysInMonth,
  cloneDate,
  parseDuration,
} from '@/lib/utils/date';

describe('date utils', () => {
  const testDate = new Date('2024-03-15T12:30:45');

  describe('formatDate', () => {
    it('should format date with default format', () => {
      expect(formatDate(testDate)).toBe('2024-03-15');
    });

    it('should format date with custom format', () => {
      expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('03/15/2024');
      expect(formatDate(testDate, 'DD-MM-YYYY')).toBe('15-03-2024');
      expect(formatDate(testDate, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 12:30:45');
    });
  });

  describe('toISOString', () => {
    it('should convert to ISO string', () => {
      const result = toISOString(testDate);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('parseDate', () => {
    it('should parse date string', () => {
      const result = parseDate('2024-03-15');
      expect(result instanceof Date).toBe(true);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // 0-indexed
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time for recent dates', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = getRelativeTime(oneHourAgo);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const fewSecondsAgo = new Date(now.getTime() - 5 * 1000);
      expect(getRelativeTime(fewSecondsAgo)).toBe('just now');
    });
  });

  describe('getTimeUntil', () => {
    it('should return time until future date', () => {
      const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const result = getTimeUntil(future);
      expect(result).toContain('in');
      expect(result).toContain('hour');
    });

    it('should return "expired" for past dates', () => {
      const past = new Date(Date.now() - 1000);
      expect(getTimeUntil(past)).toBe('expired');
    });
  });

  describe('isToday', () => {
    it('should check if date is today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
      expect(isToday(new Date('2020-01-01'))).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should check if date is yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
      expect(isYesterday(new Date())).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    it('should check if date is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isTomorrow(tomorrow)).toBe(true);
      expect(isTomorrow(new Date())).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should check if date is in past', () => {
      expect(isPast(new Date('2020-01-01'))).toBe(true);
      expect(isPast(new Date(Date.now() + 1000000))).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should check if date is in future', () => {
      expect(isFuture(new Date(Date.now() + 1000000))).toBe(true);
      expect(isFuture(new Date('2020-01-01'))).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const result = addDays(testDate, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should subtract days with negative number', () => {
      const result = addDays(testDate, -5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('addHours', () => {
    it('should add hours to date', () => {
      const result = addHours(testDate, 5);
      expect(result.getHours()).toBe(17);
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to date', () => {
      const result = addMinutes(testDate, 30);
      expect(result.getMinutes()).toBe(0); // 30 + 30 = 60 -> 0 (next hour)
    });
  });

  describe('startOfDay', () => {
    it('should get start of day', () => {
      const result = startOfDay(testDate);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should get end of day', () => {
      const result = endOfDay(testDate);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });

  describe('startOfWeek', () => {
    it('should get start of week', () => {
      const result = startOfWeek(testDate);
      expect(result.getDay()).toBe(0); // Sunday
    });
  });

  describe('endOfWeek', () => {
    it('should get end of week', () => {
      const result = endOfWeek(testDate);
      expect(result.getDay()).toBe(6); // Saturday
    });
  });

  describe('startOfMonth', () => {
    it('should get start of month', () => {
      const result = startOfMonth(testDate);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('endOfMonth', () => {
    it('should get end of month', () => {
      const result = endOfMonth(testDate);
      expect(result.getDate()).toBe(31); // March has 31 days
    });
  });

  describe('diffInDays', () => {
    it('should calculate difference in days', () => {
      const date1 = new Date('2024-03-01');
      const date2 = new Date('2024-03-15');
      expect(diffInDays(date1, date2)).toBe(14);
    });
  });

  describe('diffInHours', () => {
    it('should calculate difference in hours', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-15T15:00:00');
      expect(diffInHours(date1, date2)).toBe(5);
    });
  });

  describe('diffInMinutes', () => {
    it('should calculate difference in minutes', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-15T10:30:00');
      expect(diffInMinutes(date1, date2)).toBe(30);
    });
  });

  describe('isBetween', () => {
    it('should check if date is between two dates', () => {
      const start = new Date('2024-03-01');
      const end = new Date('2024-03-31');
      expect(isBetween(testDate, start, end)).toBe(true);
      expect(isBetween(new Date('2024-04-01'), start, end)).toBe(false);
    });
  });

  describe('getDayName', () => {
    it('should get day name', () => {
      // Friday
      const result = getDayName(testDate);
      expect(result).toBe('Friday');
    });
  });

  describe('getMonthName', () => {
    it('should get month name', () => {
      const result = getMonthName(testDate);
      expect(result).toBe('March');
    });
  });

  describe('getQuarter', () => {
    it('should get quarter', () => {
      expect(getQuarter(new Date('2024-01-15'))).toBe(1);
      expect(getQuarter(new Date('2024-04-15'))).toBe(2);
      expect(getQuarter(new Date('2024-07-15'))).toBe(3);
      expect(getQuarter(new Date('2024-10-15'))).toBe(4);
    });
  });

  describe('isLeapYear', () => {
    it('should check if leap year', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('should get days in month', () => {
      expect(getDaysInMonth(new Date('2024-02-15'))).toBe(29); // Leap year
      expect(getDaysInMonth(new Date('2023-02-15'))).toBe(28);
      expect(getDaysInMonth(new Date('2024-03-15'))).toBe(31);
    });
  });

  describe('cloneDate', () => {
    it('should clone date', () => {
      const cloned = cloneDate(testDate);
      expect(cloned.getTime()).toBe(testDate.getTime());
      expect(cloned).not.toBe(testDate);
    });
  });

  describe('parseDuration', () => {
    it('should parse duration strings', () => {
      expect(parseDuration('1s')).toBe(1000);
      expect(parseDuration('1m')).toBe(60 * 1000);
      expect(parseDuration('1h')).toBe(60 * 60 * 1000);
      expect(parseDuration('1d')).toBe(24 * 60 * 60 * 1000);
      expect(parseDuration('1w')).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should throw on invalid format', () => {
      expect(() => parseDuration('invalid')).toThrow();
    });
  });
});

