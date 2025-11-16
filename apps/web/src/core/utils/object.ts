/**
 * Object utility functions
 * @module core/utils/object
 */

/**
 * Check if value is an object
 */
export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Pick specific keys from object
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
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;
  
  Object.keys(source).forEach((key) => {
    const targetValue = target[key as keyof T];
    const sourceValue = source[key as keyof T];
    
    if (isObject(targetValue) && isObject(sourceValue)) {
      (target as any)[key] = deepMerge({ ...targetValue }, sourceValue as any);
    } else {
      (target as any)[key] = sourceValue;
    }
  });
  
  return deepMerge(target, ...sources);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
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
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : (defaultValue as T);
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return;
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * Flatten nested object
 */
export function flatten(
  obj: any,
  prefix: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (isObject(obj[key])) {
      flatten(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

/**
 * Unflatten object from dot notation
 */
export function unflatten(obj: Record<string, any>): any {
  const result: any = {};
  
  for (const key in obj) {
    setNestedValue(result, key, obj[key]);
  }
  
  return result;
}

/**
 * Map object values
 */
export function mapValues<T extends object, R>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    result[key] = mapper(obj[key], key);
  });
  
  return result;
}

/**
 * Filter object by predicate
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
 */
export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.keys(obj).forEach((key) => {
    result[String(obj[key])] = key;
  });
  
  return result;
}

/**
 * Get object keys as typed array
 */
export function keys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Get object values as typed array
 */
export function values<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

/**
 * Get object entries as typed array
 */
export function entries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

