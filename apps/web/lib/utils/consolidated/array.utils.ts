/**
 * Consolidated Array Utilities
 * Unified array manipulation functions
 */

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Remove duplicates by key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be positive');
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array randomly (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Group array items by key
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
 * Group array items by function result
 */
export function groupByFn<T>(
  array: T[],
  fn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = fn(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
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
 * Sort array by multiple keys
 */
export function sortByMultiple<T>(
  array: T[],
  keys: Array<{ key: keyof T; order?: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, order = 'asc' } of keys) {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array
 */
export function sampleSize<T>(array: T[], count: number): T[] {
  if (count <= 0) return [];
  if (count >= array.length) return shuffle(array);
  
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
}

/**
 * Move item in array
 */
export function moveItem<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Partition array by predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((item, index) => {
    if (predicate(item, index)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(array: Array<T | T[]>): T[] {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * Get intersection of arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  const [first, ...rest] = arrays;
  return first.filter((item) =>
    rest.every((arr) => arr.includes(item))
  );
}

/**
 * Get difference between arrays
 */
export function difference<T>(array: T[], ...others: T[][]): T[] {
  const othersFlat = flatten(others);
  return array.filter((item) => !othersFlat.includes(item));
}

/**
 * Get union of arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(flatten(arrays));
}

/**
 * Check if arrays are equal
 */
export function isEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

/**
 * Take first n items
 */
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, Math.max(0, count));
}

/**
 * Take last n items
 */
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(Math.max(0, array.length - count));
}

/**
 * Drop first n items
 */
export function drop<T>(array: T[], count: number): T[] {
  return array.slice(Math.max(0, count));
}

/**
 * Drop last n items
 */
export function dropLast<T>(array: T[], count: number): T[] {
  return array.slice(0, Math.max(0, array.length - count));
}

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(array: Array<T | null | undefined | false | 0 | ''>): T[] {
  return array.filter((item): item is T => Boolean(item));
}

/**
 * Range generator
 */
export function range(start: number, end?: number, step: number = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Split array at index
 */
export function splitAt<T>(array: T[], index: number): [T[], T[]] {
  return [array.slice(0, index), array.slice(index)];
}

/**
 * Zip multiple arrays together
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  return range(maxLength).map((i) =>
    arrays.map((arr) => arr[i])
  );
}

