/**
 * Consolidated String Utilities
 * Unified string manipulation functions
 */

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

/**
 * Convert to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Convert to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/**
 * Convert to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Convert to PascalCase
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Truncate string
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate in middle
 */
export function truncateMiddle(
  str: string,
  startLength: number,
  endLength: number,
  separator: string = '...'
): string {
  if (str.length <= startLength + endLength) return str;
  return str.slice(0, startLength) + separator + str.slice(-endLength);
}

/**
 * Shorten Ethereum address
 */
export function shortenAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) return address;
  return truncateMiddle(address, startLength, endLength, '...');
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string contains only digits
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Check if string is valid email
 */
export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
 * Check if string is valid URL
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Unescape HTML special characters
 */
export function unescapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|#039);/g, (entity) => map[entity]);
}

/**
 * Escape RegExp special characters
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pluralize word
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || word + 's';
}

/**
 * Template string interpolation
 */
export function template(str: string, data: Record<string, any>): string {
  return str.replace(/\{([^}]+)\}/g, (match, key) => {
    return String(data[key] ?? match);
  });
}

/**
 * Pad string to length
 */
export function pad(str: string, length: number, char: string = ' '): string {
  const padLength = length - str.length;
  if (padLength <= 0) return str;
  
  const padLeft = Math.floor(padLength / 2);
  const padRight = padLength - padLeft;
  
  return char.repeat(padLeft) + str + char.repeat(padRight);
}

/**
 * Pad start
 */
export function padStart(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad end
 */
export function padEnd(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, substring: string): number {
  return (str.match(new RegExp(escapeRegExp(substring), 'g')) || []).length;
}

/**
 * Remove diacritics (accents)
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Words from string
 */
export function words(str: string): string[] {
  return str.match(/[^\s]+/g) || [];
}

/**
 * Get initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return words(name)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Mask string (for sensitive data)
 */
export function mask(str: string, visibleStart: number = 4, visibleEnd: number = 4, maskChar: string = '*'): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const maskLength = str.length - visibleStart - visibleEnd;
  
  return start + maskChar.repeat(maskLength) + end;
}

/**
 * Strip HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Highlight text
 */
export function highlight(str: string, query: string, tag: string = 'mark'): string {
  if (!query) return str;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return str.replace(regex, `<${tag}>$1</${tag}>`);
}

