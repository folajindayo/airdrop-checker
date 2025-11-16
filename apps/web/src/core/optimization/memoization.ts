/**
 * Memoization Utilities
 * Advanced caching and memoization strategies
 */

export interface MemoizeOptions {
  maxSize?: number;
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
}

/**
 * Advanced memoization with LRU cache
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { maxSize = 100, ttl, keyGenerator } = options;
  
  const cache = new Map<string, { value: any; timestamp: number }>();
  const keys: string[] = [];

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached) {
      // Check TTL
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        // Move to end (LRU)
        const index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
          keys.push(key);
        }
        return cached.value;
      }
    }

    // Compute value
    const value = fn(...args);
    
    // Store in cache
    cache.set(key, { value, timestamp: Date.now() });
    keys.push(key);
    
    // Evict oldest if over max size
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }
    
    return value;
  }) as T;
}

/**
 * Memoize async function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { maxSize = 100, ttl, keyGenerator } = options;
  
  const cache = new Map<string, { promise: Promise<any>; timestamp: number }>();
  const keys: string[] = [];

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.promise;
      }
    }

    // Create promise
    const promise = fn(...args);
    
    // Store in cache
    cache.set(key, { promise, timestamp: Date.now() });
    keys.push(key);
    
    // Evict oldest if over max size
    if (keys.length > maxSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }
    
    return promise;
  }) as T;
}

/**
 * Create a memoized selector
 */
export function createSelector<T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = (a, b) => a === b
): (state: T) => R {
  let lastState: T | undefined;
  let lastResult: R | undefined;
  
  return (state: T): R => {
    if (lastState === undefined || !equalityFn(selector(lastState), selector(state))) {
      lastState = state;
      lastResult = selector(state);
    }
    return lastResult as R;
  };
}

