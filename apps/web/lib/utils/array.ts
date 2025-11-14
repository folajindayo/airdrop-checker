/**
 * Array utility functions
 * Helper functions for array operations
 */

/**
 * Remove duplicates from array
 * 
 * @param arr - Array to deduplicate
 * @returns Array without duplicates
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Remove duplicates by key
 * 
 * @param arr - Array of objects
 * @param key - Key to check for uniqueness
 * @returns Array without duplicates
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Group array items by key
 * 
 * @param arr - Array to group
 * @param key - Key or function to group by
 * @returns Grouped object
 */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey]!.push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk array into smaller arrays
 * 
 * @param arr - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array randomly
 * 
 * @param arr - Array to shuffle
 * @returns Shuffled array (new array)
 */
export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Get random item from array
 * 
 * @param arr - Array to pick from
 * @returns Random item
 */
export function randomItem<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random items from array
 * 
 * @param arr - Array to pick from
 * @param count - Number of items to pick
 * @returns Array of random items
 */
export function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Sort array by key
 * 
 * @param arr - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order
 * @returns Sorted array (new array)
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => number | string),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...arr];
  const getValue = typeof key === 'function' ? key : (item: T) => item[key];
  
  return sorted.sort((a, b) => {
    const aVal = getValue(a);
    const bVal = getValue(b);
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Find difference between two arrays
 * 
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Items in arr1 not in arr2
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Find intersection of two arrays
 * 
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Items in both arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Flatten nested array
 * 
 * @param arr - Array to flatten
 * @param depth - Depth to flatten (default: 1)
 * @returns Flattened array
 */
export function flatten<T>(arr: T[], depth = 1): T[] {
  if (depth === 0) return arr;
  
  return arr.reduce((flat: T[], item) => {
    if (Array.isArray(item)) {
      flat.push(...flatten(item as T[], depth - 1));
    } else {
      flat.push(item);
    }
    return flat;
  }, []);
}

/**
 * Partition array into two arrays based on predicate
 * 
 * @param arr - Array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [passed, failed]
 */
export function partition<T>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const passed: T[] = [];
  const failed: T[] = [];
  
  arr.forEach((item) => {
    if (predicate(item)) {
      passed.push(item);
    } else {
      failed.push(item);
    }
  });
  
  return [passed, failed];
}

/**
 * Sum array of numbers
 * 
 * @param arr - Array of numbers
 * @returns Sum
 */
export function sum(arr: number[]): number {
  return arr.reduce((total, num) => total + num, 0);
}

/**
 * Sum array by key
 * 
 * @param arr - Array of objects
 * @param key - Key to sum
 * @returns Sum
 */
export function sumBy<T>(arr: T[], key: keyof T): number {
  return arr.reduce((total, item) => {
    const value = item[key];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Get average of array
 * 
 * @param arr - Array of numbers
 * @returns Average
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * Get average by key
 * 
 * @param arr - Array of objects
 * @param key - Key to average
 * @returns Average
 */
export function averageBy<T>(arr: T[], key: keyof T): number {
  if (arr.length === 0) return 0;
  return sumBy(arr, key) / arr.length;
}

/**
 * Get minimum value from array
 * 
 * @param arr - Array of numbers
 * @returns Minimum value
 */
export function min(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return Math.min(...arr);
}

/**
 * Get maximum value from array
 * 
 * @param arr - Array of numbers
 * @returns Maximum value
 */
export function max(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

/**
 * Get min/max by key
 * 
 * @param arr - Array of objects
 * @param key - Key to compare
 * @returns Min and max items
 */
export function minMaxBy<T>(
  arr: T[],
  key: keyof T
): { min: T | undefined; max: T | undefined } {
  if (arr.length === 0) return { min: undefined, max: undefined };
  
  let min = arr[0];
  let max = arr[0];
  
  arr.forEach((item) => {
    if (item[key] < min![key]) min = item;
    if (item[key] > max![key]) max = item;
  });
  
  return { min, max };
}

/**
 * Check if arrays are equal
 * 
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns True if equal
 */
export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
}

/**
 * Move item in array
 * 
 * @param arr - Array
 * @param from - From index
 * @param to - To index
 * @returns New array with item moved
 */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const newArr = [...arr];
  const item = newArr.splice(from, 1)[0];
  newArr.splice(to, 0, item!);
  return newArr;
}

/**
 * Range array
 * 
 * @param start - Start value
 * @param end - End value
 * @param step - Step value
 * @returns Array of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
  const arr: number[] = [];
  for (let i = start; i <= end; i += step) {
    arr.push(i);
  }
  return arr;
}

