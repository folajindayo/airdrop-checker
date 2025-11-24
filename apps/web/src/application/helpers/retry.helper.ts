/**
 * Retry Helper
 */

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  exponentialBackoff?: boolean;
}

export class RetryHelper {
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error;
    let delay = options.delayMs;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < options.maxAttempts) {
          await this.sleep(delay);

          if (options.exponentialBackoff) {
            delay *= 2;
          }
        }
      }
    }

    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    );

    return Promise.race([promise, timeout]);
  }
}


