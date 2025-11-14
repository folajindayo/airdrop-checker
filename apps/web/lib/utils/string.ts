/**
 * String utility functions
 * Helper functions for string operations
 */

/**
 * Capitalize first letter
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize all words
 * 
 * @param str - String to capitalize
 * @returns Title cased string
 */
export function titleCase(str: string): string {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to camelCase
 * 
 * @param str - String to convert
 * @returns camelCase string
 */
export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

/**
 * Convert to snake_case
 * 
 * @param str - String to convert
 * @returns snake_case string
 */
export function snakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
    .replace(/[\s-]+/g, '_');
}

/**
 * Convert to kebab-case
 * 
 * @param str - String to convert
 * @returns kebab-case string
 */
export function kebabCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace(/^-/, '')
    .replace(/[\s_]+/g, '-');
}

/**
 * Convert to PascalCase
 * 
 * @param str - String to convert
 * @returns PascalCase string
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return capitalize(camel);
}

/**
 * Truncate string
 * 
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate in middle
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param separator - Separator (default: '...')
 * @returns Truncated string
 */
export function truncateMiddle(
  str: string,
  maxLength: number,
  separator = '...'
): string {
  if (str.length <= maxLength) return str;
  
  const charsToShow = maxLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  
  return str.slice(0, frontChars) + separator + str.slice(-backChars);
}

/**
 * Slugify string
 * 
 * @param str - String to slugify
 * @returns URL-safe slug
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
 * Remove HTML tags
 * 
 * @param str - HTML string
 * @returns Plain text
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML
 * 
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Unescape HTML
 * 
 * @param str - Escaped string
 * @returns Unescaped string
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => htmlUnescapes[entity] || entity);
}

/**
 * Pad string on left
 * 
 * @param str - String to pad
 * @param length - Target length
 * @param char - Padding character
 * @returns Padded string
 */
export function padLeft(str: string, length: number, char = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad string on right
 * 
 * @param str - String to pad
 * @param length - Target length
 * @param char - Padding character
 * @returns Padded string
 */
export function padRight(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Repeat string
 * 
 * @param str - String to repeat
 * @param count - Number of times
 * @returns Repeated string
 */
export function repeat(str: string, count: number): string {
  return str.repeat(count);
}

/**
 * Reverse string
 * 
 * @param str - String to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Count occurrences
 * 
 * @param str - String to search in
 * @param substr - Substring to count
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, substr: string): number {
  if (!substr) return 0;
  return (str.match(new RegExp(substr, 'g')) || []).length;
}

/**
 * Check if string contains substring
 * 
 * @param str - String to search in
 * @param substr - Substring to find
 * @param caseSensitive - Case sensitive search
 * @returns True if contains
 */
export function contains(
  str: string,
  substr: string,
  caseSensitive = true
): boolean {
  if (!caseSensitive) {
    return str.toLowerCase().includes(substr.toLowerCase());
  }
  return str.includes(substr);
}

/**
 * Check if string starts with any of the prefixes
 * 
 * @param str - String to check
 * @param prefixes - Array of prefixes
 * @returns True if starts with any prefix
 */
export function startsWithAny(str: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => str.startsWith(prefix));
}

/**
 * Check if string ends with any of the suffixes
 * 
 * @param str - String to check
 * @param suffixes - Array of suffixes
 * @returns True if ends with any suffix
 */
export function endsWithAny(str: string, suffixes: string[]): boolean {
  return suffixes.some((suffix) => str.endsWith(suffix));
}

/**
 * Replace all occurrences
 * 
 * @param str - String to search in
 * @param search - String to search for
 * @param replace - Replacement string
 * @returns String with replacements
 */
export function replaceAll(str: string, search: string, replace: string): string {
  return str.split(search).join(replace);
}

/**
 * Remove whitespace
 * 
 * @param str - String to trim
 * @returns Trimmed string
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Normalize whitespace
 * 
 * @param str - String to normalize
 * @returns Normalized string
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extract numbers from string
 * 
 * @param str - String to extract from
 * @returns Array of numbers
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Extract emails from string
 * 
 * @param str - String to extract from
 * @returns Array of emails
 */
export function extractEmails(str: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return str.match(emailRegex) || [];
}

/**
 * Extract URLs from string
 * 
 * @param str - String to extract from
 * @returns Array of URLs
 */
export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return str.match(urlRegex) || [];
}

/**
 * Mask string
 * 
 * @param str - String to mask
 * @param visibleStart - Visible characters at start
 * @param visibleEnd - Visible characters at end
 * @param maskChar - Mask character
 * @returns Masked string
 */
export function mask(
  str: string,
  visibleStart = 4,
  visibleEnd = 4,
  maskChar = '*'
): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  
  return start + masked + end;
}

/**
 * Generate random string
 * 
 * @param length - String length
 * @param chars - Character set
 * @returns Random string
 */
export function randomString(
  length: number,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate string similarity (Levenshtein distance)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
export function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0]![j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }
  
  return matrix[str2.length]![str1.length]!;
}

