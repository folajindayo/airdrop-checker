/**
 * String Utility Functions
 * Comprehensive utilities for string manipulation
 */

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/\s+/g, '-');
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate string to words boundary
 */
export function truncateWords(str: string, wordCount: number, suffix: string = '...'): string {
  const words = str.split(' ');
  if (words.length <= wordCount) return str;
  return words.slice(0, wordCount).join(' ') + suffix;
}

/**
 * Slugify string for URLs
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
 * Remove accents from string
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity] || entity);
}

/**
 * Strip HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Pad string to specified length
 */
export function pad(str: string, length: number, char: string = ' '): string {
  const padLength = Math.max(0, length - str.length);
  return char.repeat(padLength / 2) + str + char.repeat(padLength / 2);
}

/**
 * Pad string from left
 */
export function padLeft(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad string from right
 */
export function padRight(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Repeat string n times
 */
export function repeat(str: string, count: number): string {
  return str.repeat(Math.max(0, count));
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
export function count(str: string, search: string): number {
  if (!search) return 0;
  return (str.match(new RegExp(search, 'g')) || []).length;
}

/**
 * Replace all occurrences
 */
export function replaceAll(
  str: string,
  search: string | RegExp,
  replace: string
): string {
  if (typeof search === 'string') {
    return str.split(search).join(replace);
  }
  return str.replace(new RegExp(search, 'g'), replace);
}

/**
 * Check if string contains substring (case-insensitive)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Check if string starts with prefix (case-insensitive)
 */
export function startsWithIgnoreCase(str: string, prefix: string): boolean {
  return str.toLowerCase().startsWith(prefix.toLowerCase());
}

/**
 * Check if string ends with suffix (case-insensitive)
 */
export function endsWithIgnoreCase(str: string, suffix: string): boolean {
  return str.toLowerCase().endsWith(suffix.toLowerCase());
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Extract emails from string
 */
export function extractEmails(str: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return str.match(emailRegex) || [];
}

/**
 * Extract URLs from string
 */
export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return str.match(urlRegex) || [];
}

/**
 * Mask string (e.g., for sensitive data)
 */
export function mask(
  str: string,
  visibleStart: number = 4,
  visibleEnd: number = 4,
  maskChar: string = '*'
): string {
  if (str.length <= visibleStart + visibleEnd) {
    return str;
  }
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  
  return start + masked + end;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string, format: string = '(###) ###-####'): string {
  const numbers = phone.replace(/\D/g, '');
  let result = format;
  
  for (let i = 0; i < numbers.length; i++) {
    result = result.replace('#', numbers[i]);
  }
  
  return result.replace(/#/g, '');
}

/**
 * Generate random string
 */
export function random(length: number, charset: string = 'alphanumeric'): string {
  const charsets: Record<string, string> = {
    numeric: '0123456789',
    alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    alphanumeric: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    hex: '0123456789abcdef',
  };
  
  const chars = charsets[charset] || charset;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Convert string to boolean
 */
export function toBoolean(str: string): boolean {
  const trueValues = ['true', '1', 'yes', 'on', 'y'];
  return trueValues.includes(str.toLowerCase());
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Remove line breaks
 */
export function removeLineBreaks(str: string): string {
  return str.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Word wrap text
 */
export function wordWrap(str: string, maxLength: number): string[] {
  const words = str.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLength) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Compare strings (natural sort)
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Calculate Levenshtein distance between strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate string similarity (0-1)
 */
export function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}
