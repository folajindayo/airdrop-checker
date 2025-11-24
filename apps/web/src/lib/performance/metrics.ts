/**
 * Performance metrics and monitoring utilities
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface PerformanceMark {
  name: string;
  startTime: number;
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private metrics: PerformanceMetric[] = [];

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !end) {
      console.warn(`End mark "${endMark}" not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;
    
    this.metrics.push({
      name,
      value: duration,
      unit: "ms",
      timestamp: Date.now(),
    });

    return duration;
  }

  clearMarks(): void {
    this.marks.clear();
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  reportMetric(name: string, value: number, unit: string = "ms"): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  performanceMonitor.mark(startMark);

  return fn().then(
    (result) => {
      performanceMonitor.mark(endMark);
      const duration = performanceMonitor.measure(name, startMark, endMark);
      console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      return result;
    },
    (error) => {
      performanceMonitor.mark(endMark);
      performanceMonitor.measure(name, startMark, endMark);
      throw error;
    }
  );
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    performanceMonitor.reportMetric(name, duration);
    console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
}

export function measureRender(componentName: string): () => void {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    performanceMonitor.reportMetric(`render:${componentName}`, duration);
    
    if (duration > 16) {
      console.warn(
        `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  };
}

export interface WebVitals {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
}

export function reportWebVitals(metric: any): void {
  performanceMonitor.reportMetric(
    `webvital:${metric.name}`,
    metric.value,
    metric.unit || "ms"
  );

  console.debug(`[Web Vitals] ${metric.name}:`, metric.value);
}

export function getResourceTiming(): PerformanceResourceTiming[] {
  if (typeof window === "undefined") return [];
  return performance.getEntriesByType("resource") as PerformanceResourceTiming[];
}

export function getNavigationTiming(): PerformanceNavigationTiming | null {
  if (typeof window === "undefined") return null;
  const entries = performance.getEntriesByType("navigation");
  return entries[0] as PerformanceNavigationTiming || null;
}

export function clearPerformanceData(): void {
  performanceMonitor.clearMarks();
  performanceMonitor.clearMetrics();
  
  if (typeof window !== "undefined" && performance.clearMarks) {
    performance.clearMarks();
    performance.clearMeasures();
  }
}
