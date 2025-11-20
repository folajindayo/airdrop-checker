/**
 * Consolidated Object Utilities
 * Unified object manipulation functions
 */

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = (source as any)[key];
      const targetValue = (target as any)[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        (target as any)[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
      } else {
        (target as any)[key] = sourceValue;
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is plain object
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Get nested property value
 */
export function get<T = any>(obj: any, path: string, defaultValue?: T): T | undefined {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result?.[key] === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result;
}

/**
 * Set nested property value
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Has nested property
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current?.[key] === undefined) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Omit keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Pick keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
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
 * Get object keys with type safety
 */
export function keys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Get object values with type safety
 */
export function values<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

/**
 * Get object entries with type safety
 */
export function entries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * From entries
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: Array<[K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Map object values
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  return fromEntries(
    entries(obj).map(([key, value]) => [key, fn(value, key)])
  );
}

/**
 * Map object keys
 */
export function mapKeys<T extends object, K extends string>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => K
): Record<K, T[keyof T]> {
  return fromEntries(
    entries(obj).map(([key, value]) => [fn(key, value), value] as [K, T[keyof T]])
  );
}

/**
 * Filter object by predicate
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return fromEntries(
    entries(obj).filter(([key, value]) => predicate(value, key))
  ) as Partial<T>;
}

/**
 * Invert object (swap keys and values)
 */
export function invert<T extends Record<string, string>>(obj: T): Record<string, keyof T> {
  return fromEntries(
    entries(obj).map(([key, value]) => [value, key])
  ) as Record<string, keyof T>;
}

/**
 * Flatten nested object
 */
export function flatten(
  obj: any,
  prefix: string = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (isObject(value) && !Array.isArray(value)) {
      flatten(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Unflatten object
 */
export function unflatten(obj: Record<string, any>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    set(result, key, value);
  }
  
  return result;
}

/**
 * Is empty object
 */
export function isEmpty(obj: any): boolean {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Compact object (remove null/undefined values)
 */
export function compact<T extends object>(obj: T): Partial<T> {
  return filterObject(obj, (value) => value != null);
}

/**
 * Defaults (fill missing properties)
 */
export function defaults<T extends object>(obj: T, ...sources: Partial<T>[]): T {
  const result = { ...obj };
  
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      if (result[key as keyof T] === undefined) {
        result[key as keyof T] = source[key as keyof T]!;
      }
    });
  });
  
  return result;
}

/**
 * Deep equal comparison
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== typeof obj2) return false;
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every((key) => isEqual(obj1[key], obj2[key]));
}

/**
 * Freeze object deeply
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);
  
  Object.values(obj as object).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  });
  
  return obj;
}

