/**
 * Async utilities
 * Helper functions for asynchronous operations
 */

/**
 * Sleep for a specified duration
 * 
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 * 
 * @example
 * ```typescript
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise with the result
 * 
 * @example
 * ```typescript
 * const result = await retry(() => fetchData(), {
 *   maxAttempts: 3,
 *   delay: 1000,
 *   backoff: 2
 * });
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        onRetry?.(attempt, lastError);
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await sleep(waitTime);
      }
    }
  }

  throw lastError!;
}

/**
 * Timeout a promise
 * 
 * @param promise - Promise to timeout
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Error message for timeout
 * @returns Promise that rejects on timeout
 * 
 * @example
 * ```typescript
 * const result = await timeout(fetchData(), 5000, 'Request timed out');
 * ```
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
}

/**
 * Debounce a function
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query) => search(query), 300);
 * debouncedSearch('hello');
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle a function
 * 
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 * 
 * @example
 * ```typescript
 * const throttledUpdate = throttle((data) => update(data), 1000);
 * throttledUpdate(newData);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Run promises in batches
 * 
 * @param items - Array of items to process
 * @param fn - Function that returns a promise for each item
 * @param batchSize - Number of promises to run concurrently
 * @returns Array of results
 * 
 * @example
 * ```typescript
 * const results = await batchProcess(
 *   addresses,
 *   (addr) => fetchBalance(addr),
 *   5
 * );
 * ```
 */
export async function batchProcess<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Run promises sequentially
 * 
 * @param items - Array of items to process
 * @param fn - Function that returns a promise for each item
 * @returns Array of results
 * 
 * @example
 * ```typescript
 * const results = await sequential(tasks, (task) => processTask(task));
 * ```
 */
export async function sequential<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    results.push(await fn(items[i]!, i));
  }

  return results;
}

/**
 * Memoize an async function
 * 
 * @param fn - Function to memoize
 * @param options - Memoization options
 * @returns Memoized function
 * 
 * @example
 * ```typescript
 * const memoizedFetch = memoizeAsync(
 *   (url) => fetch(url),
 *   { ttl: 60000 }
 * );
 * ```
 */
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    ttl?: number;
    maxSize?: number;
    keyFn?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { ttl, maxSize = 100, keyFn = (...args) => JSON.stringify(args) } = options;
  const cache = new Map<string, { value: unknown; timestamp: number }>();

  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    const value = await fn(...args);

    // Enforce max cache size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, { value, timestamp: Date.now() });
    return value;
  }) as T;
}

/**
 * Poll a function until a condition is met
 * 
 * @param fn - Function to poll
 * @param options - Polling options
 * @returns Promise with the result
 * 
 * @example
 * ```typescript
 * const result = await poll(
 *   () => checkStatus(),
 *   {
 *     condition: (status) => status === 'complete',
 *     interval: 1000,
 *     maxAttempts: 30
 *   }
 * );
 * ```
 */
export async function poll<T>(
  fn: () => Promise<T>,
  options: {
    condition: (result: T) => boolean;
    interval?: number;
    maxAttempts?: number;
    onPoll?: (attempt: number, result: T) => void;
  }
): Promise<T> {
  const { condition, interval = 1000, maxAttempts = 10, onPoll } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    onPoll?.(attempt, result);

    if (condition(result)) {
      return result;
    }

    if (attempt < maxAttempts) {
      await sleep(interval);
    }
  }

  throw new Error('Polling exceeded maximum attempts');
}

/**
 * Race multiple promises with timeout
 * 
 * @param promises - Array of promises
 * @param ms - Timeout in milliseconds
 * @returns First resolved promise or timeout error
 * 
 * @example
 * ```typescript
 * const result = await raceWithTimeout(
 *   [promise1, promise2],
 *   5000
 * );
 * ```
 */
export function raceWithTimeout<T>(
  promises: Promise<T>[],
  ms: number
): Promise<T> {
  return timeout(Promise.race(promises), ms);
}

/**
 * Execute promises with a circuit breaker
 * 
 * @param fn - Function to execute
 * @param options - Circuit breaker options
 * @returns Circuit breaker wrapped function
 * 
 * @example
 * ```typescript
 * const safeFetch = circuitBreaker(
 *   () => fetch(url),
 *   { threshold: 5, timeout: 60000 }
 * );
 * ```
 */
export function circuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: {
    threshold?: number;
    timeout?: number;
    onOpen?: () => void;
    onClose?: () => void;
  } = {}
): T {
  const { threshold = 5, timeout = 60000, onOpen, onClose } = options;

  let failures = 0;
  let lastFailureTime = 0;
  let isOpen = false;

  return (async (...args: Parameters<T>) => {
    // Check if circuit should be closed
    if (isOpen && Date.now() - lastFailureTime > timeout) {
      isOpen = false;
      failures = 0;
      onClose?.();
    }

    if (isOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn(...args);
      failures = 0; // Reset on success
      return result;
    } catch (error) {
      failures++;
      lastFailureTime = Date.now();

      if (failures >= threshold) {
        isOpen = true;
        onOpen?.();
      }

      throw error;
    }
  }) as T;
}

/**
 * Create a queue for async operations
 * 
 * @param concurrency - Maximum concurrent operations
 * @returns Queue methods
 * 
 * @example
 * ```typescript
 * const queue = createQueue(3);
 * queue.add(() => fetchData(1));
 * queue.add(() => fetchData(2));
 * ```
 */
export function createQueue(concurrency: number) {
  let running = 0;
  const queue: (() => Promise<unknown>)[] = [];

  async function run(fn: () => Promise<unknown>): Promise<unknown> {
    running++;
    try {
      return await fn();
    } finally {
      running--;
      processQueue();
    }
  }

  function processQueue() {
    while (running < concurrency && queue.length > 0) {
      const fn = queue.shift();
      if (fn) run(fn);
    }
  }

  return {
    add: <T>(fn: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            resolve(await fn());
          } catch (error) {
            reject(error);
          }
        });
        processQueue();
      });
    },
    size: () => queue.length,
    running: () => running,
  };
}

/**
 * Safely execute a promise and return [error, result] tuple
 * 
 * @param promise - Promise to execute
 * @returns Tuple of [error, result]
 * 
 * @example
 * ```typescript
 * const [error, data] = await safeAwait(fetchData());
 * if (error) {
 *   handleError(error);
 * } else {
 *   processData(data);
 * }
 * ```
 */
export async function safeAwait<T>(
  promise: Promise<T>
): Promise<[Error, null] | [null, T]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
}

