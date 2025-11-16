/**
 * Date and time utility functions
 * Provides consistent date handling across the application
 * @module core/utils/datetime
 */

/**
 * Format timestamp to human-readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to human-readable date and time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted datetime string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  
  return 'just now';
}

/**
 * Get time until a future date (e.g., "in 2 days")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time until string
 */
export function getTimeUntil(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return 'now';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) return `in ${months} month${months > 1 ? 's' : ''}`;
  if (weeks > 0) return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  return 'in a moment';
}

/**
 * Check if a date is in the past
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Check if a date is in the future
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if date is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now();
}

/**
 * Check if a date is today
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if date is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get start of day timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Timestamp for start of day
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Timestamp for end of day
 */
export function getEndOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Add days to a timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @param days - Number of days to add (can be negative)
 * @returns New timestamp
 */
export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/**
 * Add hours to a timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @param hours - Number of hours to add (can be negative)
 * @returns New timestamp
 */
export function addHours(timestamp: number, hours: number): number {
  return timestamp + hours * 60 * 60 * 1000;
}

/**
 * Add minutes to a timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New timestamp
 */
export function addMinutes(timestamp: number, minutes: number): number {
  return timestamp + minutes * 60 * 1000;
}

/**
 * Get difference between two timestamps in days
 * @param timestamp1 - First timestamp
 * @param timestamp2 - Second timestamp
 * @returns Difference in days
 */
export function getDaysDifference(
  timestamp1: number,
  timestamp2: number
): number {
  const diff = Math.abs(timestamp1 - timestamp2);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Parse ISO date string to timestamp
 * @param dateString - ISO date string
 * @returns Unix timestamp or null if invalid
 */
export function parseISODate(dateString: string): number | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.getTime();
  } catch {
    return null;
  }
}

/**
 * Format timestamp to ISO string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns ISO date string
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Get timestamp for N days ago
 * @param days - Number of days
 * @returns Timestamp for N days ago
 */
export function getDaysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

/**
 * Get timestamp for N hours ago
 * @param hours - Number of hours
 * @returns Timestamp for N hours ago
 */
export function getHoursAgo(hours: number): number {
  return Date.now() - hours * 60 * 60 * 1000;
}

/**
 * Check if timestamp is within last N days
 * @param timestamp - Timestamp to check
 * @param days - Number of days
 * @returns True if within last N days
 */
export function isWithinLastNDays(timestamp: number, days: number): boolean {
  const cutoff = getDaysAgo(days);
  return timestamp >= cutoff && timestamp <= Date.now();
}

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Get timestamp for start of current month
 * @returns Timestamp for start of month
 */
export function getStartOfMonth(): number {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get timestamp for end of current month
 * @returns Timestamp for end of month
 */
export function getEndOfMonth(): number {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Format timestamp to short date (MM/DD/YYYY)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Short date string
 */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Get week number of year
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Week number (1-53)
 */
export function getWeekNumber(timestamp: number): number {
  const date = new Date(timestamp);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

