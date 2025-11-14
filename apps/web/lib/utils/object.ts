/**
 * Object Utility Functions
 * Comprehensive utilities for object manipulation
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Deep merge multiple objects
 */
export function deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  const result: any = {};

  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = deepMerge(result[key] || {}, value);
        } else {
          result[key] = value;
        }
      }
    }
  }

  return result as T;
}

/**
 * Pick specific properties from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: any = {};
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Omit specific properties from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result: any = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) {
    return true;
  }

  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }

  return false;
}

/**
 * Get nested property value safely
 */
export function get<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * Set nested property value
 */
export function set(obj: any, path: string | string[], value: any): void {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Check if two objects are deeply equal
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Map object values
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key);
    }
  }
  
  return result;
}

/**
 * Map object keys
 */
export function mapKeys<T extends object>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => string
): Record<string, T[keyof T]> {
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = fn(key, obj[key]);
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Filter object by predicate
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Invert object keys and values
 */
export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[String(obj[key])] = key;
    }
  }
  
  return result;
}

/**
 * Flatten nested object
 */
export function flatten(
  obj: any,
  prefix: string = '',
  separator: string = '.'
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flatten(value, newKey, separator));
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

/**
 * Unflatten a flat object
 */
export function unflatten(
  obj: Record<string, any>,
  separator: string = '.'
): any {
  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      set(result, key.split(separator), obj[key]);
    }
  }

  return result;
}

/**
 * Group array of objects by key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Create object from array with key function
 */
export function keyBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T> {
  return array.reduce((result, item) => {
    const itemKey = typeof key === 'function' ? key(item) : String(item[key]);
    result[itemKey] = item;
    return result;
  }, {} as Record<string, T>);
}

/**
 * Count values in array
 */
export function countBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, number> {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    result[groupKey] = (result[groupKey] || 0) + 1;
    return result;
  }, {} as Record<string, number>);
}

/**
 * Remove undefined/null values from object
 */
export function compact<T extends object>(obj: T): Partial<T> {
  return filterObject(obj, (value) => value !== undefined && value !== null);
}

/**
 * Create object with default values for missing keys
 */
export function defaults<T extends object>(
  obj: Partial<T>,
  defaultValues: T
): T {
  return { ...defaultValues, ...obj };
}

/**
 * Check if object has property (type-safe)
 */
export function has<T extends object>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Get all values from object
 */
export function values<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

/**
 * Get all entries from object
 */
export function entries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Freeze object deeply
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      (typeof value === 'object' || typeof value === 'function') &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj;
}
