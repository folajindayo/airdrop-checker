/**
 * Database performance optimization utilities
 */

export interface QueryPerformance {
  query: string;
  duration: number;
  timestamp: number;
  rows?: number;
}

class DatabasePerformanceMonitor {
  private queries: QueryPerformance[] = [];
  private slowQueryThreshold: number = 1000; // 1 second

  logQuery(query: string, duration: number, rows?: number): void {
    const performance: QueryPerformance = {
      query,
      duration,
      timestamp: Date.now(),
      rows,
    };

    this.queries.push(performance);

    if (duration > this.slowQueryThreshold) {
      console.warn(
        `[Slow Query] ${duration.toFixed(2)}ms: ${query.substring(0, 100)}...`
      );
    }
  }

  getSlowQueries(threshold?: number): QueryPerformance[] {
    const limit = threshold ?? this.slowQueryThreshold;
    return this.queries.filter((q) => q.duration > limit);
  }

  getAverageQueryTime(): number {
    if (this.queries.length === 0) return 0;
    const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
    return total / this.queries.length;
  }

  clear(): void {
    this.queries = [];
  }

  getQueries(): QueryPerformance[] {
    return [...this.queries];
  }

  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }
}

export const dbMonitor = new DatabasePerformanceMonitor();

export function measureQuery<T>(
  query: string,
  executor: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  return executor()
    .then((result) => {
      const duration = performance.now() - start;
      const rows = Array.isArray(result) ? result.length : undefined;
      dbMonitor.logQuery(query, duration, rows);
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - start;
      dbMonitor.logQuery(query, duration);
      throw error;
    });
}

export interface BatchQueryOptions {
  batchSize?: number;
  delay?: number;
}

export async function batchQuery<T, R>(
  items: T[],
  executor: (batch: T[]) => Promise<R>,
  options: BatchQueryOptions = {}
): Promise<R[]> {
  const { batchSize = 100, delay = 0 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const result = await executor(batch);
    results.push(result);

    if (delay > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

export function createQueryCache<K, V>(ttl: number = 300000) {
  const cache = new Map<K, { value: V; expiry: number }>();

  return {
    get(key: K): V | null {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
      }

      return entry.value;
    },

    set(key: K, value: V): void {
      cache.set(key, {
        value,
        expiry: Date.now() + ttl,
      });
    },

    delete(key: K): void {
      cache.delete(key);
    },

    clear(): void {
      cache.clear();
    },
  };
}

