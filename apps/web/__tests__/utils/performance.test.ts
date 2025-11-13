/**
 * Tests for performance utilities
 */

import {
  PerformanceMonitor,
  performanceMonitor,
  measurePerformance,
  withPerformanceMonitoring,
} from '@/lib/utils/performance';

describe('Performance Utils', () => {
  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    describe('start', () => {
      it('should track operation duration', () => {
        const end = monitor.start('test-operation');
        
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Wait
        }
        
        const metrics = end();
        
        expect(metrics.operation).toBe('test-operation');
        expect(metrics.duration).toBeGreaterThan(0);
        expect(metrics.timestamp).toBeDefined();
      });
    });

    describe('getMetrics', () => {
      it('should return all metrics', () => {
        const end = monitor.start('test');
        end();
        
        const metrics = monitor.getMetrics();
        expect(metrics.length).toBeGreaterThan(0);
      });

      it('should filter by operation', () => {
        const end1 = monitor.start('operation1');
        end1();
        
        const end2 = monitor.start('operation2');
        end2();
        
        const metrics = monitor.getMetrics('operation1');
        expect(metrics.every((m) => m.operation === 'operation1')).toBe(true);
      });
    });

    describe('getAverageDuration', () => {
      it('should calculate average duration', () => {
        const end1 = monitor.start('test');
        end1();
        
        const end2 = monitor.start('test');
        end2();
        
        const average = monitor.getAverageDuration('test');
        expect(average).toBeGreaterThan(0);
      });

      it('should return 0 for non-existent operation', () => {
        const average = monitor.getAverageDuration('non-existent');
        expect(average).toBe(0);
      });
    });

    describe('clear', () => {
      it('should clear all metrics', () => {
        const end = monitor.start('test');
        end();
        
        monitor.clear();
        expect(monitor.getMetrics().length).toBe(0);
      });
    });
  });

  describe('measurePerformance', () => {
    it('should measure async function performance', async () => {
      const { result, metrics } = await measurePerformance('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'result';
      });

      expect(result).toBe('result');
      expect(metrics.operation).toBe('test');
      expect(metrics.duration).toBeGreaterThan(0);
    });
  });

  describe('withPerformanceMonitoring', () => {
    it('should wrap handler with performance monitoring', async () => {
      const handler = async () => 'result';
      const monitored = withPerformanceMonitoring('test', handler);

      const result = await monitored();
      expect(result).toBe('result');
    });
  });
});

