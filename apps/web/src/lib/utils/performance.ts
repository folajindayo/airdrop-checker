/**
 * Performance monitoring utilities
 * Provides performance tracking and monitoring
 * 
 * @module PerformanceUtils
 */

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  duration: number;
  timestamp: number;
  operation: string;
  metadata?: Record<string, any>;
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  /**
   * Start performance tracking
   * 
   * @param operation - Operation name
   * @returns Function to end tracking
   * 
   * @example
   * ```typescript
   * const end = monitor.start('database-query');
   * // ... perform operation ...
   * const metrics = end();
   * ```
   */
  start(operation: string): () => PerformanceMetrics {
    const startTime = performance.now();
    const timestamp = Date.now();

    return () => {
      const duration = performance.now() - startTime;
      const metric: PerformanceMetrics = {
        duration,
        timestamp,
        operation,
      };

      this.addMetric(metric);
      return metric;
    };
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get performance metrics
   * 
   * @param operation - Optional operation name to filter
   * @returns Array of performance metrics
   */
  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter((m) => m.operation === operation);
    }
    return [...this.metrics];
  }

  /**
   * Get average duration for operation
   * 
   * @param operation - Operation name
   * @returns Average duration in milliseconds
   */
  getAverageDuration(operation: string): number {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation);
    
    if (operationMetrics.length === 0) {
      return 0;
    }

    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure async function performance
 * 
 * @param operation - Operation name
 * @param fn - Async function to measure
 * @returns Function result with performance metrics
 * 
 * @example
 * ```typescript
 * const result = await measurePerformance('api-call', async () => {
 *   return await fetchData();
 * });
 * ```
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const end = performanceMonitor.start(operation);
  
  try {
    const result = await fn();
    const metrics = end();
    return { result, metrics };
  } catch (error) {
    end();
    throw error;
  }
}

/**
 * Create performance middleware
 * 
 * @param operation - Operation name
 * @returns Middleware function
 */
export function withPerformanceMonitoring<T extends any[]>(
  operation: string,
  handler: (...args: T) => Promise<any>
): (...args: T) => Promise<any> {
  return async (...args: T) => {
    const end = performanceMonitor.start(operation);
    
    try {
      const result = await handler(...args);
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  };
}

