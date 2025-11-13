/**
 * Performance monitoring utilities
 */

export class PerformanceMetrics {
  private static timings: Map<string, number> = new Map();
  
  static startTimer(label: string): void {
    this.timings.set(label, Date.now());
  }
  
  static endTimer(label: string): number {
    const start = this.timings.get(label);
    if (!start) return 0;
    
    const duration = Date.now() - start;
    this.timings.delete(label);
    
    console.log(`[Performance] ${label}: ${duration}ms`);
    return duration;
  }
  
  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
}

export function measureTime<T extends (...args: any[]) => any>(
  target: T
): T {
  return ((...args: Parameters<T>) => {
    const label = target.name || 'anonymous';
    PerformanceMetrics.startTimer(label);
    
    const result = target(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => PerformanceMetrics.endTimer(label));
    }
    
    PerformanceMetrics.endTimer(label);
    return result;
  }) as T;
}

