/**
 * @fileoverview Tests for bundle analyzer
 */

import {
  formatBytes,
  estimateGzippedSize,
  analyzeBundleComposition,
  getBundleSizeRecommendations,
  compareBundleSizes,
  calculateBundleScore,
  generateBundleReport,
  type BundleAnalysis,
  type ModuleInfo,
} from '@/lib/performance/bundle-analyzer';

describe('Bundle Analyzer', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should respect decimal places', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });

    it('should handle small numbers', () => {
      expect(formatBytes(512)).toBe('512 Bytes');
    });
  });

  describe('estimateGzippedSize', () => {
    it('should estimate gzipped size', () => {
      expect(estimateGzippedSize(1000)).toBe(300);
      expect(estimateGzippedSize(10000)).toBe(3000);
    });

    it('should return integer', () => {
      const result = estimateGzippedSize(1234);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('analyzeBundleComposition', () => {
    const modules: ModuleInfo[] = [
      { name: 'node_modules/react/index.js', size: 150000, percentage: 15 },
      { name: 'node_modules/lodash/index.js', size: 100000, percentage: 10 },
      { name: 'src/app.ts', size: 500000, percentage: 50 },
      { name: 'src/utils.ts', size: 250000, percentage: 25 },
    ];

    it('should separate libraries and application code', () => {
      const result = analyzeBundleComposition(modules);
      
      expect(result.libraries.length).toBe(2);
      expect(result.application.length).toBe(2);
    });

    it('should identify largest modules', () => {
      const result = analyzeBundleComposition(modules);
      
      expect(result.largestModules.length).toBeLessThanOrEqual(10);
      expect(result.largestModules[0].size).toBeGreaterThanOrEqual(
        result.largestModules[result.largestModules.length - 1].size
      );
    });

    it('should sort largest modules by size', () => {
      const result = analyzeBundleComposition(modules);
      
      for (let i = 0; i < result.largestModules.length - 1; i++) {
        expect(result.largestModules[i].size).toBeGreaterThanOrEqual(
          result.largestModules[i + 1].size
        );
      }
    });
  });

  describe('getBundleSizeRecommendations', () => {
    it('should recommend code splitting for large bundles', () => {
      const analysis = { totalSize: 600 * 1024 };
      const recommendations = getBundleSizeRecommendations(analysis);
      
      expect(recommendations.some((r) => r.includes('code splitting'))).toBe(true);
    });

    it('should warn about bundles exceeding 1MB', () => {
      const analysis = { totalSize: 1.5 * 1024 * 1024 };
      const recommendations = getBundleSizeRecommendations(analysis);
      
      expect(recommendations.some((r) => r.includes('exceeds 1MB'))).toBe(true);
    });

    it('should identify large modules', () => {
      const modules: ModuleInfo[] = [
        { name: 'large-module', size: 150 * 1024, percentage: 15 },
      ];
      const analysis = { modules };
      const recommendations = getBundleSizeRecommendations(analysis);
      
      expect(recommendations.some((r) => r.includes('exceed 100KB'))).toBe(true);
    });

    it('should detect duplicate dependencies', () => {
      const modules: ModuleInfo[] = [
        { name: 'node_modules/react/v1/index.js', size: 100000, percentage: 10 },
        { name: 'node_modules/react/v2/index.js', size: 100000, percentage: 10 },
      ];
      const analysis = { modules };
      const recommendations = getBundleSizeRecommendations(analysis);
      
      expect(recommendations.some((r) => r.includes('duplicate'))).toBe(true);
    });

    it('should return positive message for optimized bundles', () => {
      const analysis = { totalSize: 100 * 1024, modules: [] };
      const recommendations = getBundleSizeRecommendations(analysis);
      
      expect(recommendations.some((r) => r.includes('optimized'))).toBe(true);
    });
  });

  describe('compareBundleSizes', () => {
    it('should detect increased size', () => {
      const result = compareBundleSizes(1000, 1500);
      
      expect(result.status).toBe('increased');
      expect(result.difference).toBe(500);
      expect(result.percentageChange).toBe(50);
    });

    it('should detect decreased size', () => {
      const result = compareBundleSizes(1000, 800);
      
      expect(result.status).toBe('decreased');
      expect(result.difference).toBe(-200);
      expect(result.percentageChange).toBe(-20);
    });

    it('should detect unchanged size', () => {
      const result = compareBundleSizes(1000, 1050);
      
      expect(result.status).toBe('unchanged');
    });

    it('should handle zero previous size', () => {
      const result = compareBundleSizes(0, 1000);
      
      expect(result.percentageChange).toBe(0);
    });

    it('should include all required fields', () => {
      const result = compareBundleSizes(1000, 1200);
      
      expect(result).toHaveProperty('previousSize');
      expect(result).toHaveProperty('currentSize');
      expect(result).toHaveProperty('difference');
      expect(result).toHaveProperty('percentageChange');
      expect(result).toHaveProperty('status');
    });
  });

  describe('calculateBundleScore', () => {
    it('should give perfect score for small bundle', () => {
      const analysis = {
        totalSize: 100 * 1024,
        modules: [],
        chunks: [],
      };
      const result = calculateBundleScore(analysis);
      
      expect(result.score).toBe(100);
      expect(result.grade).toBe('A');
    });

    it('should penalize large bundle', () => {
      const analysis = {
        totalSize: 1.5 * 1024 * 1024,
        modules: [],
        chunks: [],
      };
      const result = calculateBundleScore(analysis);
      
      expect(result.score).toBeLessThan(100);
      expect(result.details.length).toBeGreaterThan(0);
    });

    it('should penalize large modules', () => {
      const modules: ModuleInfo[] = [
        { name: 'large1', size: 150 * 1024, percentage: 15 },
        { name: 'large2', size: 150 * 1024, percentage: 15 },
      ];
      const analysis = { modules, chunks: [] };
      const result = calculateBundleScore(analysis);
      
      expect(result.score).toBeLessThan(100);
    });

    it('should penalize too many chunks', () => {
      const chunks = Array.from({ length: 25 }, (_, i) => ({
        name: `chunk-${i}`,
        size: 10000,
        modules: [],
      }));
      const analysis = { chunks, modules: [] };
      const result = calculateBundleScore(analysis);
      
      expect(result.score).toBeLessThan(100);
    });

    it('should calculate correct grade', () => {
      expect(calculateBundleScore({ totalSize: 100 * 1024, modules: [] }).grade).toBe('A');
      expect(calculateBundleScore({ totalSize: 300 * 1024, modules: [] }).grade).toBe('A');
      expect(calculateBundleScore({ totalSize: 600 * 1024, modules: [] }).grade).toBe('B');
      expect(calculateBundleScore({ totalSize: 1.5 * 1024 * 1024, modules: [] }).grade).toBe('D');
    });

    it('should not allow negative scores', () => {
      const analysis = {
        totalSize: 10 * 1024 * 1024,
        modules: Array.from({ length: 20 }, (_, i) => ({
          name: `large-${i}`,
          size: 200 * 1024,
          percentage: 5,
        })),
        chunks: Array.from({ length: 50 }, (_, i) => ({
          name: `chunk-${i}`,
          size: 10000,
          modules: [],
        })),
      };
      const result = calculateBundleScore(analysis);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateBundleReport', () => {
    const mockAnalysis: BundleAnalysis = {
      totalSize: 800000,
      parsedSize: 750000,
      gzippedSize: 240000,
      modules: [
        { name: 'react', size: 150000, percentage: 18.75 },
        { name: 'app', size: 500000, percentage: 62.5 },
      ],
      chunks: [],
      recommendations: ['Consider code splitting'],
    };

    it('should generate report with all sections', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toContain('# Bundle Analysis Report');
      expect(report).toContain('## Size Summary');
      expect(report).toContain('## Bundle Composition');
      expect(report).toContain('## Largest Modules');
      expect(report).toContain('## Recommendations');
      expect(report).toContain('## Performance Score');
    });

    it('should include size information', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toContain('Total Size:');
      expect(report).toContain('Parsed Size:');
      expect(report).toContain('Gzipped Size:');
    });

    it('should list largest modules', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toContain('react');
      expect(report).toContain('app');
    });

    it('should include recommendations', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toContain('Consider code splitting');
    });

    it('should include performance grade', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toMatch(/Grade: [A-F]/);
    });

    it('should be formatted as markdown', () => {
      const report = generateBundleReport(mockAnalysis);
      
      expect(report).toContain('#');
      expect(report).toContain('##');
      expect(report).toContain('-');
    });
  });

  describe('Integration', () => {
    it('should handle complete analysis workflow', () => {
      const modules: ModuleInfo[] = [
        { name: 'node_modules/react', size: 150000, percentage: 15 },
        { name: 'node_modules/lodash', size: 100000, percentage: 10 },
        { name: 'src/app', size: 500000, percentage: 50 },
        { name: 'src/utils', size: 250000, percentage: 25 },
      ];

      const analysis: BundleAnalysis = {
        totalSize: 1000000,
        parsedSize: 950000,
        gzippedSize: estimateGzippedSize(1000000),
        modules,
        chunks: [],
        recommendations: getBundleSizeRecommendations({ totalSize: 1000000, modules }),
      };

      const composition = analyzeBundleComposition(modules);
      const score = calculateBundleScore(analysis);
      const report = generateBundleReport(analysis);

      expect(composition).toBeDefined();
      expect(score).toBeDefined();
      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
    });

    it('should handle comparison workflow', () => {
      const previous = 1000000;
      const current = 1200000;

      const comparison = compareBundleSizes(previous, current);

      expect(comparison.status).toBe('increased');
      expect(comparison.difference).toBeGreaterThan(0);
      expect(comparison.percentageChange).toBeGreaterThan(0);
    });
  });
});

