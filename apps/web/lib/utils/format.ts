/**
 * Formatting utilities
 * Provides consistent formatting functions for the application
 */

/**
 * Format number with commas
 * 
 * @param num - Number to format
 * @returns Formatted string with commas
 * 
 * @example
 * ```typescript
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 * ```
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency (USD)
 * 
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1000) // "$1,000.00"
 * ```
 */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format large numbers with suffixes (K, M, B)
 * 
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with suffix
 * 
 * @example
 * ```typescript
 * formatCompactNumber(1500) // "1.5K"
 * formatCompactNumber(2500000) // "2.5M"
 * formatCompactNumber(1000000000) // "1.0B"
 * ```
 */
export function formatCompactNumber(num: number, decimals = 1): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals) + 'K';
  }
  return num.toString();
}

/**
 * Format percentage
 * 
 * @param value - Decimal value (e.g., 0.5 for 50%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 * 
 * @example
 * ```typescript
 * formatPercentage(0.5) // "50.00%"
 * formatPercentage(0.123, 1) // "12.3%"
 * ```
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format wallet address (truncated)
 * 
 * @param address - Ethereum address
 * @param startChars - Number of characters at start (default: 6)
 * @param endChars - Number of characters at end (default: 4)
 * @returns Truncated address
 * 
 * @example
 * ```typescript
 * formatAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // "0x1234...5678"
 * ```
 */
export function formatAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format transaction hash (truncated)
 * 
 * @param hash - Transaction hash
 * @param chars - Number of characters to show on each side (default: 6)
 * @returns Truncated hash
 * 
 * @example
 * ```typescript
 * formatTxHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890')
 * // "0xabcd...7890"
 * ```
 */
export function formatTxHash(hash: string, chars = 6): string {
  return formatAddress(hash, chars, chars);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * 
 * @param date - Date to format
 * @returns Relative time string
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() + 86400000)) // "in 1 day"
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  }
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  }
  if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(diffDay / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Format date to readable string
 * 
 * @param date - Date to format
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2025-01-01')) // "Jan 1, 2025"
 * formatDate(new Date('2025-01-01'), true) // "Jan 1, 2025 at 12:00 AM"
 * ```
 */
export function formatDate(date: Date | string | number, includeTime = false): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format file size
 * 
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * ```
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format duration (milliseconds to human readable)
 * 
 * @param ms - Duration in milliseconds
 * @returns Human readable duration string
 * 
 * @example
 * ```typescript
 * formatDuration(1500) // "1.5s"
 * formatDuration(65000) // "1m 5s"
 * formatDuration(3665000) // "1h 1m 5s"
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

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
 * Pluralize a word based on count
 * 
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form of word (optional, defaults to singular + 's')
 * @returns Pluralized string
 * 
 * @example
 * ```typescript
 * pluralize(1, 'item') // "1 item"
 * pluralize(5, 'item') // "5 items"
 * pluralize(2, 'child', 'children') // "2 children"
 * ```
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 * 
 * @example
 * ```typescript
 * truncate('This is a long text', 10) // "This is a..."
 * ```
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 * 
 * @example
 * ```typescript
 * capitalize('hello world') // "Hello world"
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 * 
 * @param str - String to convert
 * @returns Title cased string
 * 
 * @example
 * ```typescript
 * titleCase('hello world') // "Hello World"
 * ```
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 * 
 * @param str - camelCase string
 * @returns Title Case string
 * 
 * @example
 * ```typescript
 * camelToTitle('helloWorld') // "Hello World"
 * ```
 */
export function camelToTitle(str: string): string {
  const result = str.replace(/([A-Z])/g, ' $1');
  return capitalize(result.trim());
}

