/**
 * Formatting utilities for display purposes
 * Provides consistent formatting across the application
 * @module core/utils/formatting
 */

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency value
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @param decimals - Number of decimal places
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage
 * @param value - Value to format (0-100 or 0-1 depending on normalized param)
 * @param normalized - Whether value is already 0-1 (default: false)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  normalized: boolean = false,
  decimals: number = 1
): string {
  const percent = normalized ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Shorten Ethereum address (0x1234...5678)
 * @param address - Full Ethereum address
 * @param startChars - Number of characters at start (default: 6)
 * @param endChars - Number of characters at end (default: 4)
 * @returns Shortened address
 */
export function shortenAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Shorten transaction hash
 * @param hash - Full transaction hash
 * @param startChars - Number of characters at start (default: 10)
 * @param endChars - Number of characters at end (default: 8)
 * @returns Shortened hash
 */
export function shortenTxHash(
  hash: string,
  startChars: number = 10,
  endChars: number = 8
): string {
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Format token amount with decimals
 * @param amount - Raw token amount (as string or bigint)
 * @param decimals - Token decimals
 * @param displayDecimals - Number of decimals to display
 * @returns Formatted token amount
 */
export function formatTokenAmount(
  amount: string | bigint,
  decimals: number,
  displayDecimals: number = 4
): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const remainder = value % divisor;
  
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  
  const decimalPart = remainder.toString().padStart(decimals, '0');
  const trimmed = decimalPart.slice(0, displayDecimals).replace(/0+$/, '');
  
  if (trimmed.length === 0) {
    return whole.toString();
  }
  
  return `${whole}.${trimmed}`;
}

/**
 * Format large numbers with K, M, B suffixes
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string with suffix
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

/**
 * Format file size
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case
 * @param str - Snake case string
 * @returns Title case string
 */
export function snakeToTitle(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 * @param str - Camel case string
 * @returns Title case string
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format gas amount in Gwei
 * @param gasInWei - Gas amount in Wei
 * @param decimals - Number of decimal places
 * @returns Formatted gas string
 */
export function formatGasInGwei(
  gasInWei: string | bigint,
  decimals: number = 2
): string {
  const wei = typeof gasInWei === 'string' ? BigInt(gasInWei) : gasInWei;
  const gwei = Number(wei) / 1e9;
  return `${gwei.toFixed(decimals)} Gwei`;
}

/**
 * Format Wei to Ether
 * @param wei - Amount in Wei
 * @param decimals - Number of decimal places
 * @returns Formatted Ether string
 */
export function formatWeiToEther(
  wei: string | bigint,
  decimals: number = 4
): string {
  const weiAmount = typeof wei === 'string' ? BigInt(wei) : wei;
  const ether = Number(weiAmount) / 1e18;
  return `${ether.toFixed(decimals)} ETH`;
}

/**
 * Format score with color indicator
 * @param score - Score value (0-100)
 * @returns Object with formatted score and color
 */
export function formatScore(score: number): {
  formatted: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
} {
  const formatted = `${Math.round(score)}%`;
  let color: 'green' | 'yellow' | 'orange' | 'red';
  
  if (score >= 75) color = 'green';
  else if (score >= 50) color = 'yellow';
  else if (score >= 25) color = 'orange';
  else color = 'red';
  
  return { formatted, color };
}

/**
 * Pluralize word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Format array as comma-separated list with "and"
 * @param items - Array of items
 * @returns Formatted list string
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, and ${last}`;
}

/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Convert string to slug format
 * @param str - String to slugify
 * @returns Slug string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

