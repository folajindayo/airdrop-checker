/**
 * @fileoverview Bundle analysis utilities
 * 
 * Utilities for analyzing and optimizing bundle sizes
 */

/**
 * Bundle analysis result
 */
export interface BundleAnalysis {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Parsed bundle size */
  parsedSize: number;
  /** Gzipped size */
  gzippedSize: number;
  /** Module breakdown */
  modules: ModuleInfo[];
  /** Chunk breakdown */
  chunks: ChunkInfo[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Module information
 */
export interface ModuleInfo {
  /** Module name */
  name: string;
  /** Module size in bytes */
  size: number;
  /** Percentage of total bundle */
  percentage: number;
  /** Dependencies */
  dependencies?: string[];
}

/**
 * Chunk information
 */
export interface ChunkInfo {
  /** Chunk name */
  name: string;
  /** Chunk size in bytes */
  size: number;
  /** Modules in chunk */
  modules: string[];
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate gzipped size estimate
 */
export function estimateGzippedSize(size: number): number {
  // Typical gzip compression ratio is around 30%
  return Math.floor(size * 0.3);
}

/**
 * Analyze bundle composition
 */
export function analyzeBundleComposition(
  modules: ModuleInfo[]
): {
  libraries: ModuleInfo[];
  application: ModuleInfo[];
  largestModules: ModuleInfo[];
} {
  const libraries = modules.filter((m) =>
    m.name.includes('node_modules')
  );

  const application = modules.filter((m) =>
    !m.name.includes('node_modules')
  );

  const largestModules = [...modules].sort((a, b) => b.size - a.size).slice(0, 10);

  return {
    libraries,
    application,
    largestModules,
  };
}

/**
 * Get bundle size recommendations
 */
export function getBundleSizeRecommendations(
  analysis: Partial<BundleAnalysis>
): string[] {
  const recommendations: string[] = [];

  // Check total bundle size
  if (analysis.totalSize && analysis.totalSize > 500 * 1024) {
    recommendations.push(
      `Total bundle size is ${formatBytes(analysis.totalSize)}. Consider code splitting to reduce initial load.`
    );
  }

  if (analysis.totalSize && analysis.totalSize > 1024 * 1024) {
    recommendations.push(
      'Bundle size exceeds 1MB. This will significantly impact page load performance.'
    );
  }

  // Check for large modules
  if (analysis.modules) {
    const largeModules = analysis.modules.filter((m) => m.size > 100 * 1024);
    if (largeModules.length > 0) {
      recommendations.push(
        `${largeModules.length} modules exceed 100KB. Consider lazy loading or tree shaking.`
      );

      largeModules.slice(0, 3).forEach((module) => {
        recommendations.push(
          `  • ${module.name}: ${formatBytes(module.size)}`
        );
      });
    }
  }

  // Check for duplicate dependencies
  if (analysis.modules) {
    const moduleNames = new Map<string, number>();
    analysis.modules.forEach((m) => {
      const baseName = m.name.split('node_modules/').pop()?.split('/')[0];
      if (baseName) {
        moduleNames.set(baseName, (moduleNames.get(baseName) || 0) + 1);
      }
    });

    const duplicates = Array.from(moduleNames.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      recommendations.push(
        `Found ${duplicates.length} potentially duplicate dependencies. Check for version conflicts.`
      );
    }
  }

  // Check for unoptimized images or assets
  if (analysis.chunks) {
    const assetChunks = analysis.chunks.filter((c) =>
      c.name.match(/\.(png|jpg|jpeg|svg|gif)$/i)
    );

    if (assetChunks.length > 0) {
      const totalAssetSize = assetChunks.reduce((sum, c) => sum + c.size, 0);
      if (totalAssetSize > 200 * 1024) {
        recommendations.push(
          `Asset files total ${formatBytes(totalAssetSize)}. Consider image optimization.`
        );
      }
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Bundle size is optimized. Great job!');
  }

  return recommendations;
}

/**
 * Compare bundle sizes
 */
export interface BundleComparison {
  /** Previous size */
  previousSize: number;
  /** Current size */
  currentSize: number;
  /** Size difference */
  difference: number;
  /** Percentage change */
  percentageChange: number;
  /** Status: increased, decreased, unchanged */
  status: 'increased' | 'decreased' | 'unchanged';
}

export function compareBundleSizes(
  previousSize: number,
  currentSize: number
): BundleComparison {
  const difference = currentSize - previousSize;
  const percentageChange =
    previousSize > 0 ? (difference / previousSize) * 100 : 0;

  let status: 'increased' | 'decreased' | 'unchanged';
  if (Math.abs(difference) < 100) {
    status = 'unchanged';
  } else if (difference > 0) {
    status = 'increased';
  } else {
    status = 'decreased';
  }

  return {
    previousSize,
    currentSize,
    difference,
    percentageChange,
    status,
  };
}

/**
 * Calculate bundle performance score
 */
export function calculateBundleScore(analysis: Partial<BundleAnalysis>): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  details: string[];
} {
  let score = 100;
  const details: string[] = [];

  // Penalize large total size
  if (analysis.totalSize) {
    if (analysis.totalSize > 1024 * 1024) {
      score -= 30;
      details.push('Bundle exceeds 1MB (-30 points)');
    } else if (analysis.totalSize > 500 * 1024) {
      score -= 15;
      details.push('Bundle exceeds 500KB (-15 points)');
    } else if (analysis.totalSize > 250 * 1024) {
      score -= 5;
      details.push('Bundle exceeds 250KB (-5 points)');
    }
  }

  // Penalize large individual modules
  if (analysis.modules) {
    const largeModules = analysis.modules.filter((m) => m.size > 100 * 1024);
    if (largeModules.length > 0) {
      const penalty = Math.min(20, largeModules.length * 5);
      score -= penalty;
      details.push(`${largeModules.length} large modules (-${penalty} points)`);
    }
  }

  // Penalize many chunks (potential over-splitting)
  if (analysis.chunks && analysis.chunks.length > 20) {
    score -= 10;
    details.push('Too many chunks may impact performance (-10 points)');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Calculate grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade, details };
}

/**
 * Generate bundle report
 */
export function generateBundleReport(analysis: BundleAnalysis): string {
  const lines: string[] = [];

  lines.push('# Bundle Analysis Report');
  lines.push('');

  // Size summary
  lines.push('## Size Summary');
  lines.push(`- Total Size: ${formatBytes(analysis.totalSize)}`);
  lines.push(`- Parsed Size: ${formatBytes(analysis.parsedSize)}`);
  lines.push(`- Gzipped Size: ${formatBytes(analysis.gzippedSize)}`);
  lines.push('');

  // Composition
  const composition = analyzeBundleComposition(analysis.modules);
  lines.push('## Bundle Composition');
  lines.push(
    `- Libraries: ${composition.libraries.length} modules (${formatBytes(
      composition.libraries.reduce((sum, m) => sum + m.size, 0)
    )})`
  );
  lines.push(
    `- Application: ${composition.application.length} modules (${formatBytes(
      composition.application.reduce((sum, m) => sum + m.size, 0)
    )})`
  );
  lines.push('');

  // Largest modules
  lines.push('## Largest Modules');
  composition.largestModules.forEach((module, i) => {
    lines.push(
      `${i + 1}. ${module.name}: ${formatBytes(module.size)} (${module.percentage.toFixed(1)}%)`
    );
  });
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  analysis.recommendations.forEach((rec) => {
    lines.push(`- ${rec}`);
  });
  lines.push('');

  // Performance score
  const scoreResult = calculateBundleScore(analysis);
  lines.push('## Performance Score');
  lines.push(`Grade: ${scoreResult.grade} (${scoreResult.score}/100)`);
  scoreResult.details.forEach((detail) => {
    lines.push(`- ${detail}`);
  });

  return lines.join('\n');
}

/**
 * Example usage:
 * 
 * const analysis: BundleAnalysis = {
 *   totalSize: 800000,
 *   parsedSize: 750000,
 *   gzippedSize: 240000,
 *   modules: [
 *     { name: 'react', size: 150000, percentage: 18.75 },
 *     { name: 'app', size: 500000, percentage: 62.5 },
 *   ],
 *   chunks: [],
 *   recommendations: [],
 * };
 * 
 * const report = generateBundleReport(analysis);
 * console.log(report);
 * 
 * const score = calculateBundleScore(analysis);
 * console.log(`Bundle Grade: ${score.grade}`);
 */

