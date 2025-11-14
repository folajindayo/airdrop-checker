/**
 * Object utility functions
 * Helper functions for object operations
 */

/**
 * Pick specific keys from object
 * 
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with picked keys
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 * 
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without omitted keys
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (obj instanceof Object) {
    const cloned = {} as T;
    Object.keys(obj).forEach((key) => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
}

/**
 * Deep merge two objects
 * 
 * @param target - Target object
 * @param source - Source object
 * @returns Merged object
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  Object.keys(source).forEach((key) => {
    const targetValue = (result as any)[key];
    const sourceValue = (source as any)[key];
    
    if (
      targetValue &&
      sourceValue &&
      typeof targetValue === 'object' &&
      typeof sourceValue === 'object' &&
      !Array.isArray(targetValue) &&
      !Array.isArray(sourceValue)
    ) {
      (result as any)[key] = deepMerge(targetValue, sourceValue);
    } else {
      (result as any)[key] = sourceValue;
    }
  });
  
  return result;
}

/**
 * Check if object is empty
 * 
 * @param obj - Object to check
 * @returns True if empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get nested property value
 * 
 * @param obj - Object to access
 * @param path - Dot-notation path
 * @param defaultValue - Default value if not found
 * @returns Property value
 */
export function get<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Set nested property value
 * 
 * @param obj - Object to modify
 * @param path - Dot-notation path
 * @param value - Value to set
 * @returns Modified object
 */
export function set<T extends object>(obj: T, path: string, value: any): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current: any = obj;
  
  keys.forEach((key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  });
  
  current[lastKey] = value;
  return obj;
}

/**
 * Check if object has property
 * 
 * @param obj - Object to check
 * @param path - Dot-notation path
 * @returns True if property exists
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

/**
 * Map object values
 * 
 * @param obj - Source object
 * @param fn - Mapping function
 * @returns New object with mapped values
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    result[key] = fn(obj[key], key);
  });
  
  return result;
}

/**
 * Map object keys
 * 
 * @param obj - Source object
 * @param fn - Mapping function
 * @returns New object with mapped keys
 */
export function mapKeys<T extends object>(
  obj: T,
  fn: (key: keyof T) => string
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    result[fn(key)] = obj[key];
  });
  
  return result;
}

/**
 * Filter object by predicate
 * 
 * @param obj - Source object
 * @param predicate - Filter function
 * @returns Filtered object
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result = {} as Partial<T>;
  
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    if (predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  });
  
  return result;
}

/**
 * Invert object keys and values
 * 
 * @param obj - Object to invert
 * @returns Inverted object
 */
export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, keyof T> {
  const result: Record<string, keyof T> = {};
  
  Object.keys(obj).forEach((key) => {
    result[String(obj[key])] = key as keyof T;
  });
  
  return result;
}

/**
 * Flatten nested object
 * 
 * @param obj - Object to flatten
 * @param prefix - Key prefix
 * @returns Flattened object
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach((key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  });
  
  return result;
}

/**
 * Unflatten object
 * 
 * @param obj - Flattened object
 * @returns Nested object
 */
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach((key) => {
    set(result, key, obj[key]);
  });
  
  return result;
}

/**
 * Compare two objects for equality
 * 
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if equal
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }
  
  if (obj1 === null || obj2 === null) return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every((key) => isEqual(obj1[key], obj2[key]));
}

/**
 * Get object entries with typed keys
 * 
 * @param obj - Source object
 * @returns Array of [key, value] tuples
 */
export function entries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Convert object to query string
 * 
 * @param obj - Object to convert
 * @returns Query string
 */
export function toQueryString(obj: Record<string, any>): string {
  return Object.keys(obj)
    .filter((key) => obj[key] !== undefined && obj[key] !== null)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`
    )
    .join('&');
}

/**
 * Parse query string to object
 * 
 * @param queryString - Query string to parse
 * @returns Parsed object
 */
export function fromQueryString(queryString: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (!queryString) return result;
  
  const cleanQuery = queryString.startsWith('?')
    ? queryString.slice(1)
    : queryString;
    
  cleanQuery.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  
  return result;
}

