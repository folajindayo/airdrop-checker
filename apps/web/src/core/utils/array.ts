/**
 * Array utility functions
 * @module core/utils/array
 */

/**
 * Chunk array into smaller arrays
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 * @param array - Array with possible duplicates
 * @returns Array with unique values
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Object with grouped items
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Shuffle array randomly using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random item from array
 * @param array - Array to sample from
 * @returns Random item or undefined if array is empty
 */
export function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array
 * @param array - Array to sample from
 * @param count - Number of items to sample
 * @returns Array of random items
 */
export function sampleMany<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Sort array by key
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Get unique items by key
 * @param array - Array with possible duplicates
 * @param key - Key to check uniqueness
 * @returns Array with unique items
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Partition array into two based on predicate
 * @param array - Array to partition
 * @param predicate - Function to determine partition
 * @returns Tuple of [truthy, falsy] arrays
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

/**
 * Get intersection of two arrays
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array of common elements
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Get difference between two arrays (items in arr1 not in arr2)
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array of different elements
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Flatten nested array one level deep
 * @param array - Nested array
 * @returns Flattened array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat() as T[];
}

/**
 * Sum numeric array
 * @param array - Array of numbers
 * @returns Sum of all numbers
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0);
}

/**
 * Calculate average of numeric array
 * @param array - Array of numbers
 * @returns Average value
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Get minimum value from array
 * @param array - Array of numbers
 * @returns Minimum value
 */
export function min(array: number[]): number {
  return Math.min(...array);
}

/**
 * Get maximum value from array
 * @param array - Array of numbers
 * @returns Maximum value
 */
export function max(array: number[]): number {
  return Math.max(...array);
}

/**
 * Check if array is empty
 * @param array - Array to check
 * @returns True if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Check if array is not empty
 * @param array - Array to check
 * @returns True if array has items
 */
export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

