/**
 * Tests for Date Utility Functions
 */

import {
  formatDate,
  formatRelative,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWeekend,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  diffInDays,
  diffInHours,
  diffInMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  daysInMonth,
  getDayName,
  getMonthName,
  parseDate,
  getQuarter,
  getWeekOfYear,
  isLeapYear,
  getAge,
  formatDuration,
} from '@/lib/utils/date';

describe('Date Utilities', () => {
  const testDate = new Date('2023-06-15T12:00:00');

  describe('formatDate', () => {
    it('should format date with default format', () => {
      expect(formatDate(testDate)).toBe('2023-06-15');
    });

    it('should format with custom format', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD HH:mm')).toBe('2023-06-15 12:00');
    });
  });

  describe('formatRelative', () => {
    it('should format relative time', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 5); // 5 minutes ago
      
      const result = formatRelative(past);
      expect(result).toContain('minute');
    });

    it('should show "just now" for very recent dates', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 1000 * 30); // 30 seconds ago
      
      expect(formatRelative(recent)).toBe('just now');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday(testDate)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });
  });

  describe('isTomorrow', () => {
    it('should return true for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isTomorrow(tomorrow)).toBe(true);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      expect(isPast(testDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(isPast(future)).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(isFuture(future)).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFuture(testDate)).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2023-06-17'); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2023-06-18'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekdays', () => {
      const monday = new Date('2023-06-19'); // Monday
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days', () => {
      const result = addDays(testDate, 5);
      expect(result.getDate()).toBe(20);
    });
  });

  describe('addMonths', () => {
    it('should add months', () => {
      const result = addMonths(testDate, 2);
      expect(result.getMonth()).toBe(7); // August (0-indexed)
    });
  });

  describe('addYears', () => {
    it('should add years', () => {
      const result = addYears(testDate, 1);
      expect(result.getFullYear()).toBe(2024);
    });
  });

  describe('subDays', () => {
    it('should subtract days', () => {
      const result = subDays(testDate, 5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('subMonths', () => {
    it('should subtract months', () => {
      const result = subMonths(testDate, 2);
      expect(result.getMonth()).toBe(3); // April (0-indexed)
    });
  });

  describe('subYears', () => {
    it('should subtract years', () => {
      const result = subYears(testDate, 1);
      expect(result.getFullYear()).toBe(2022);
    });
  });

  describe('diffInDays', () => {
    it('should calculate difference in days', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-11');
      expect(diffInDays(date1, date2)).toBe(10);
    });
  });

  describe('diffInHours', () => {
    it('should calculate difference in hours', () => {
      const date1 = new Date('2023-01-01T00:00:00');
      const date2 = new Date('2023-01-01T12:00:00');
      expect(diffInHours(date1, date2)).toBe(12);
    });
  });

  describe('diffInMinutes', () => {
    it('should calculate difference in minutes', () => {
      const date1 = new Date('2023-01-01T00:00:00');
      const date2 = new Date('2023-01-01T00:30:00');
      expect(diffInMinutes(date1, date2)).toBe(30);
    });
  });

  describe('startOfDay', () => {
    it('should get start of day', () => {
      const result = startOfDay(testDate);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should get end of day', () => {
      const result = endOfDay(testDate);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
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
      expect(result.getDate()).toBe(30); // June has 30 days
    });
  });

  describe('startOfYear', () => {
    it('should get start of year', () => {
      const result = startOfYear(testDate);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });
  });

  describe('endOfYear', () => {
    it('should get end of year', () => {
      const result = endOfYear(testDate);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(31);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2023-06-15T10:00:00');
      const date2 = new Date('2023-06-15T20:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2023-06-15');
      const date2 = new Date('2023-06-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isSameMonth', () => {
    it('should return true for same month', () => {
      const date1 = new Date('2023-06-01');
      const date2 = new Date('2023-06-30');
      expect(isSameMonth(date1, date2)).toBe(true);
    });
  });

  describe('isSameYear', () => {
    it('should return true for same year', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-12-31');
      expect(isSameYear(date1, date2)).toBe(true);
    });
  });

  describe('daysInMonth', () => {
    it('should return correct days in month', () => {
      expect(daysInMonth(new Date('2023-02-01'))).toBe(28);
      expect(daysInMonth(new Date('2023-06-01'))).toBe(30);
      expect(daysInMonth(new Date('2023-01-01'))).toBe(31);
    });
  });

  describe('getDayName', () => {
    it('should return day name', () => {
      const thursday = new Date('2023-06-15'); // Thursday
      expect(getDayName(thursday)).toBe('Thursday');
      expect(getDayName(thursday, true)).toBe('Thu');
    });
  });

  describe('getMonthName', () => {
    it('should return month name', () => {
      expect(getMonthName(testDate)).toBe('June');
      expect(getMonthName(testDate, true)).toBe('Jun');
    });
  });

  describe('parseDate', () => {
    it('should parse date string', () => {
      const result = parseDate('2023-06-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
    });

    it('should return null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull();
    });
  });

  describe('getQuarter', () => {
    it('should return correct quarter', () => {
      expect(getQuarter(new Date('2023-01-01'))).toBe(1);
      expect(getQuarter(new Date('2023-04-01'))).toBe(2);
      expect(getQuarter(new Date('2023-07-01'))).toBe(3);
      expect(getQuarter(new Date('2023-10-01'))).toBe(4);
    });
  });

  describe('getWeekOfYear', () => {
    it('should calculate week of year', () => {
      const week = getWeekOfYear(testDate);
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });
  });

  describe('isLeapYear', () => {
    it('should identify leap years', () => {
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getAge', () => {
    it('should calculate age', () => {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - 25);
      expect(getAge(birthdate)).toBe(25);
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(1000)).toContain('s');
      expect(formatDuration(60000)).toContain('m');
      expect(formatDuration(3600000)).toContain('h');
      expect(formatDuration(86400000)).toContain('d');
    });
  });
});
