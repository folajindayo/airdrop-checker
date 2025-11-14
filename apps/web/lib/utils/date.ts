/**
 * Date utility functions
 * Helper functions for date operations
 */

/**
 * Format date to string
 * 
 * @param date - Date to format
 * @param format - Format string (YYYY-MM-DD, MM/DD/YYYY, etc.)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format date to ISO string
 * 
 * @param date - Date to format
 * @returns ISO 8601 string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse date string
 * 
 * @param dateString - Date string to parse
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get relative time string
 * 
 * @param date - Date to format
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Get time until date
 * 
 * @param date - Future date
 * @returns Time until string (e.g., "in 2 hours")
 */
export function getTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0) return 'expired';
  if (seconds < 60) return 'less than a minute';
  if (minutes < 60) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  return `in ${days} day${days > 1 ? 's' : ''}`;
}

/**
 * Check if date is today
 * 
 * @param date - Date to check
 * @returns True if today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 * 
 * @param date - Date to check
 * @returns True if yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 * 
 * @param date - Date to check
 * @returns True if tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if date is in the past
 * 
 * @param date - Date to check
 * @returns True if in past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is in the future
 * 
 * @param date - Date to check
 * @returns True if in future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Add days to date
 * 
 * @param date - Source date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to date
 * 
 * @param date - Source date
 * @param hours - Number of hours to add
 * @returns New date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to date
 * 
 * @param date - Source date
 * @param minutes - Number of minutes to add
 * @returns New date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get start of day
 * 
 * @param date - Date
 * @returns Start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 * 
 * @param date - Date
 * @returns End of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week
 * 
 * @param date - Date
 * @returns Start of week
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of week
 * 
 * @param date - Date
 * @returns End of week
 */
export function endOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (6 - day);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month
 * 
 * @param date - Date
 * @returns Start of month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 * 
 * @param date - Date
 * @returns End of month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get difference in days
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function diffInDays(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of hours between dates
 */
export function diffInHours(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60 * 60));
}

/**
 * Get difference in minutes
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of minutes between dates
 */
export function diffInMinutes(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60));
}

/**
 * Check if date is between two dates
 * 
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns True if between
 */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

/**
 * Get day name
 * 
 * @param date - Date
 * @param locale - Locale string
 * @returns Day name
 */
export function getDayName(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Get month name
 * 
 * @param date - Date
 * @param locale - Locale string
 * @returns Month name
 */
export function getMonthName(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * Get quarter
 * 
 * @param date - Date
 * @returns Quarter number (1-4)
 */
export function getQuarter(date: Date): number {
  const month = date.getMonth();
  return Math.floor(month / 3) + 1;
}

/**
 * Check if leap year
 * 
 * @param year - Year number
 * @returns True if leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get days in month
 * 
 * @param date - Date
 * @returns Number of days
 */
export function getDaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Clone date
 * 
 * @param date - Date to clone
 * @returns Cloned date
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Parse duration string to milliseconds
 * 
 * @param duration - Duration string (e.g., "1d", "2h", "30m")
 * @returns Milliseconds
 */
export function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  const match = duration.match(/^(\d+)(ms|s|m|h|d|w)$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const [, value, unit] = match;
  return parseInt(value!, 10) * (units[unit!] || 0);
}

