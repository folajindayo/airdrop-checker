/**
 * Object utility functions
 */

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
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
  keys.forEach(key => {
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
  
  Object.keys(source).forEach(key => {
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

function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

