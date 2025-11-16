/**
 * Retry logic utilities
 * Provides retry mechanisms for failed operations
 * @module core/utils/retry
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
      
      if (!config.shouldRetry(lastError)) {
        throw lastError;
      }
      
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      config.onRetry(attempt, lastError);
      
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier,
        config.exponentialBackoff
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Retry failed');
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

