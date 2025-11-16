/**
 * Performance Profiler
 * Tracks and reports performance metrics
 */

export interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceProfiler {
  private entries: PerformanceEntry[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing and record the entry
   */
  end(name: string, metadata?: Record<string, any>): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.entries.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    this.marks.delete(name);
    return duration;
  }

  /**
   * Get all recorded entries
   */
  getEntries(): PerformanceEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by name
   */
  getEntriesByName(name: string): PerformanceEntry[] {
    return this.entries.filter(entry => entry.name === name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const entries = this.getEntriesByName(name);
    if (entries.length === 0) return 0;
    
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    this.marks.clear();
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify({
      entries: this.entries,
      summary: this.getSummary(),
    }, null, 2);
  }

  /**
   * Get summary statistics
   */
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    const uniqueNames = new Set(this.entries.map(e => e.name));
    
    for (const name of uniqueNames) {
      const entries = this.getEntriesByName(name);
      const durations = entries.map(e => e.duration);
      
      summary[name] = {
        count: entries.length,
        avg: this.getAverageDuration(name),
        min: Math.min(...durations),
        max: Math.max(...durations),
        total: durations.reduce((sum, d) => sum + d, 0),
      };
    }
    
    return summary;
  }
}

export const profiler = new PerformanceProfiler();

