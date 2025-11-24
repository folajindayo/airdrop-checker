/**
 * Retry logic utilities
 * Provides retry mechanisms for failed operations
 */

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean;
  /** Function to determine if error should trigger retry */
  shouldRetry?: (error: Error) => boolean;
  /** Callback called on each retry */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  exponentialBackoff: true,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (!config.shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Don't retry if this was the last attempt
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // Call onRetry callback
      config.onRetry(attempt, lastError);
      
      // Calculate delay
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier,
        config.exponentialBackoff
      );
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {}
): Promise<T> {
  return Promise.race([
    retry(operation, options),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

/**
 * Calculate delay for next retry attempt
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
  exponential: boolean
): number {
  let delay: number;
  
  if (exponential) {
    delay = initialDelay * Math.pow(multiplier, attempt - 1);
  } else {
    delay = initialDelay * attempt;
  }
  
  // Add jitter (randomness) to prevent thundering herd
  delay = delay * (0.5 + Math.random() * 0.5);
  
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry only for specific error types
 */
export function createRetryForErrors(
  errorCodes: string[],
  options: RetryOptions = {}
): <T>(operation: () => Promise<T>) => Promise<T> {
  return <T>(operation: () => Promise<T>) =>
    retry(operation, {
      ...options,
      shouldRetry: (error: Error) => {
        const errorCode = (error as any).code || error.name;
        return errorCodes.includes(errorCode);
      },
    });
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker<T> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly operation: () => Promise<T>,
    private readonly options: {
      failureThreshold?: number;
      resetTimeout?: number;
      retryOptions?: RetryOptions;
    } = {}
  ) {
    this.options.failureThreshold = options.failureThreshold || 5;
    this.options.resetTimeout = options.resetTimeout || 60000;
  }
  
  async execute(): Promise<T> {
    // Check circuit state
    if (this.state === 'OPEN') {
      // Check if we should try half-open
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout!) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      // Execute operation
      const result = await retry(this.operation, this.options.retryOptions);
      
      // Success - reset circuit
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Failure - record it
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = 'OPEN';
    }
  }
  
  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }
  
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Retry with rate limiting
 */
export class RateLimitedRetry {
  private queue: Array<{
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;
  
  constructor(
    private readonly requestsPerSecond: number,
    private readonly retryOptions: RetryOptions = {}
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const delay = 1000 / this.requestsPerSecond;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await retry(item.operation, this.retryOptions);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
      
      if (this.queue.length > 0) {
        await sleep(delay);
      }
    }
    
    this.processing = false;
  }
}

/**
 * Batch retry operations
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions & {
    concurrency?: number;
    stopOnError?: boolean;
  } = {}
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const { concurrency = 5, stopOnError = false, ...retryOptions } = options;
  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];
  const executing: Promise<void>[] = [];
  
  for (const operation of operations) {
    const promise = retry(operation, retryOptions)
      .then((data) => {
        results.push({ success: true, data });
      })
      .catch((error) => {
        results.push({ success: false, error });
        if (stopOnError) {
          throw error;
        }
      });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }
  
  await Promise.allSettled(executing);
  return results;
}

/**
 * Create a retryable function
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return retry(() => fn(...args), options);
  }) as T;
}

