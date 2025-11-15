/**
 * Memoization Utilities
 * 
 * Functions to optimize expensive calculations
 */

/**
 * Simple memoization for single-argument functions
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();

  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Memoization with custom key generator
 */
export function memoizeWith<T extends any[], R>(
  fn: (...args: T) => R,
  keyFn: (...args: T) => string
): (...args: T) => R {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Memoization with TTL (time to live)
 */
export function memoizeWithTTL<T extends any[], R>(
  fn: (...args: T) => R,
  ttlMs: number
): (...args: T) => R {
  const cache = new Map<string, { value: R; expiresAt: number }>();

  return (...args: T): R => {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now < cached.expiresAt) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, {
      value: result,
      expiresAt: now + ttlMs,
    });

    return result;
  };
}

/**
 * LRU memoization with size limit
 */
export function memoizeLRU<T extends any[], R>(
  fn: (...args: T) => R,
  maxSize: number = 100
): (...args: T) => R {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const value = cache.get(key)!;
      // Move to end
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    // Remove oldest if at capacity
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Async memoization
 */
export function memoizeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  const cache = new Map<string, Promise<R>>();

  return (...args: T): Promise<R> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn(...args).catch((error) => {
      // Remove from cache on error
      cache.delete(key);
      throw error;
    });

    cache.set(key, promise);
    return promise;
  };
}

