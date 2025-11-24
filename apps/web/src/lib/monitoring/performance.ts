/**
 * Performance monitoring utilities
 * Track and measure application performance
 */

import { logger, logPerformance } from './logger';

/**
 * Performance metric entry
 */
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Start timing an operation
   * Returns a function to stop timing
   * 
   * @param operation - Name of the operation
   * @param tags - Optional tags for filtering metrics
   * @returns Stop function that records the duration
   * 
   * @example
   * ```typescript
   * const stopTimer = performanceMonitor.startTimer('database_query');
   * await db.query();
   * stopTimer(); // Records the duration
   * ```
   */
  startTimer(operation: string, tags?: Record<string, string>): () => void {
    const startTime = performance.now();

    return (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        tags,
        metadata,
      });

      logPerformance(operation, duration, { tags, metadata });
    };
  }

  /**
   * Measure async operation
   * 
   * @param operation - Name of the operation
   * @param fn - Async function to measure
   * @param tags - Optional tags
   * @returns Result of the function
   * 
   * @example
   * ```typescript
   * const result = await performanceMonitor.measure('api_call', async () => {
   *   return await fetch(url);
   * });
   * ```
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const stopTimer = this.startTimer(operation, tags);

    try {
      const result = await fn();
      stopTimer({ success: true });
      return result;
    } catch (error) {
      stopTimer({ success: false, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Measure sync operation
   * 
   * @param operation - Name of the operation
   * @param fn - Function to measure
   * @param tags - Optional tags
   * @returns Result of the function
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    const stopTimer = this.startTimer(operation, tags);

    try {
      const result = fn();
      stopTimer({ success: true });
      return result;
    } catch (error) {
      stopTimer({ success: false, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Record a metric manually
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (metric.duration > 1000) {
      logger.warn('Slow operation detected', {
        operation: metric.operation,
        duration: metric.duration,
        ...metric.tags,
        ...metric.metadata,
      });
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by operation name
   */
  getMetricsByOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.operation === operation);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string): number {
    const metrics = this.getMetricsByOperation(operation);
    if (metrics.length === 0) {
      return 0;
    }

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get percentile duration for an operation
   * 
   * @param operation - Operation name
   * @param percentile - Percentile (e.g., 95 for p95)
   */
  getPercentileDuration(operation: string, percentile: number): number {
    const metrics = this.getMetricsByOperation(operation);
    if (metrics.length === 0) {
      return 0;
    }

    const sorted = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  }> {
    const operations = new Set(this.metrics.map((m) => m.operation));
    const summary: Record<string, {
      count: number;
      avg: number;
      min: number;
      max: number;
      p50: number;
      p95: number;
      p99: number;
    }> = {};

    for (const operation of operations) {
      const metrics = this.getMetricsByOperation(operation);
      const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);

      summary[operation] = {
        count: metrics.length,
        avg: this.getAverageDuration(operation),
        min: Math.min(...durations),
        max: Math.max(...durations),
        p50: this.getPercentileDuration(operation, 50),
        p95: this.getPercentileDuration(operation, 95),
        p99: this.getPercentileDuration(operation, 99),
      };
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Singleton performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 * 
 * @example
 * ```typescript
 * class Service {
 *   @measurePerformance('service_method')
 *   async fetchData() {
 *     // Implementation
 *   }
 * }
 * ```
 */
export function measurePerformance(operation?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return await performanceMonitor.measure(operationName, async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * Helper to measure API route performance
 * Wraps route handler with performance tracking
 * 
 * @param operation - Name of the operation
 * @param handler - Route handler function
 * @returns Wrapped handler with performance tracking
 * 
 * @example
 * ```typescript
 * export const GET = withPerformanceTracking('api_airdrops', async (request) => {
 *   // Handler implementation
 * });
 * ```
 */
export function withPerformanceTracking<T extends unknown[]>(
  operation: string,
  handler: (...args: T) => Promise<Response>
): (...args: T) => Promise<Response> {
  return async (...args: T): Promise<Response> => {
    return await performanceMonitor.measure(operation, async () => {
      return await handler(...args);
    });
  };
}

/**
 * Web Vitals tracking
 * Tracks Core Web Vitals metrics
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

/**
 * Track Web Vitals
 * Call this from client-side code
 * 
 * @param metrics - Web Vitals metrics
 * 
 * @example
 * ```typescript
 * if (typeof window !== 'undefined') {
 *   trackWebVitals({
 *     FCP: 1200,
 *     LCP: 2500,
 *     FID: 100,
 *     CLS: 0.1,
 *     TTFB: 800,
 *   });
 * }
 * ```
 */
export function trackWebVitals(metrics: WebVitals): void {
  logger.info('Web Vitals', metrics);

  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics (Google Analytics, Vercel Analytics, etc.)
  }
}

