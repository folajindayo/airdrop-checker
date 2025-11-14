/**
 * @fileoverview Code splitting utilities for dynamic imports
 * @module lib/performance/code-splitting
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Loading component options
 */
export interface LoadingOptions {
  /**
   * Show loading spinner
   */
  showSpinner?: boolean;

  /**
   * Custom loading component
   */
  loadingComponent?: ComponentType;

  /**
   * Minimum loading time (ms) for smooth transitions
   */
  minLoadTime?: number;

  /**
   * Error boundary
   */
  errorBoundary?: ComponentType<{ error: Error }>;
}

/**
 * Default loading component
 */
const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

/**
 * Create lazy-loaded component with options
 */
export function lazyLoad<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LoadingOptions = {}
): ComponentType<P> {
  const {
    showSpinner = true,
    loadingComponent: LoadingComponent = DefaultLoader,
    minLoadTime = 0,
  } = options;

  // Wrap import with minimum load time if specified
  const wrappedImport = minLoadTime > 0
    ? async () => {
        const [component] = await Promise.all([
          importFn(),
          new Promise((resolve) => setTimeout(resolve, minLoadTime)),
        ]);
        return component;
      }
    : importFn;

  return dynamic(wrappedImport, {
    loading: showSpinner ? LoadingComponent : undefined,
    ssr: false,
  });
}

/**
 * Preload a dynamic component
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  // Trigger the import without rendering
  importFn().catch((error) => {
    console.error('Failed to preload component:', error);
  });
}

/**
 * Route-based code splitting helpers
 */
export const routes = {
  /**
   * Dashboard route components
   */
  dashboard: lazyLoad(() => import('@/app/dashboard/page')),

  /**
   * Portfolio route components
   */
  portfolio: lazyLoad(() => import('@/app/portfolio/page')),

  /**
   * Airdrops route components
   */
  airdrops: lazyLoad(() => import('@/app/airdrops/page')),

  /**
   * Settings route components
   */
  settings: lazyLoad(() => import('@/app/settings/page')),
};

/**
 * Feature-based code splitting
 */
export const features = {
  /**
   * Charts and visualizations
   */
  charts: {
    lineChart: lazyLoad(() => import('@/components/charts/LineChart')),
    barChart: lazyLoad(() => import('@/components/charts/BarChart')),
    pieChart: lazyLoad(() => import('@/components/charts/PieChart')),
  },

  /**
   * Advanced forms
   */
  forms: {
    advancedForm: lazyLoad(() => import('@/components/forms/AdvancedForm')),
    multiStepForm: lazyLoad(() => import('@/components/forms/MultiStepForm')),
  },

  /**
   * Data tables
   */
  tables: {
    dataTable: lazyLoad(() => import('@/components/tables/DataTable')),
    virtualTable: lazyLoad(() => import('@/components/tables/VirtualTable')),
  },
};

/**
 * Lazy load with retry logic
 */
export function lazyLoadWithRetry<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  maxRetries = 3
): ComponentType<P> {
  const retryImport = async (attempt = 0): Promise<{ default: ComponentType<P> }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
        return retryImport(attempt + 1);
      }
      throw error;
    }
  };

  return lazyLoad(retryImport);
}

/**
 * Prefetch components on hover
 */
export function usePrefetchOnHover(
  importFn: () => Promise<{ default: ComponentType<any> }>
): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  let prefetched = false;

  const prefetch = () => {
    if (!prefetched) {
      prefetched = true;
      preloadComponent(importFn);
    }
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

/**
 * Bundle size helper - estimate component size
 */
export async function estimateComponentSize(
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<number> {
  try {
    const startTime = performance.now();
    await importFn();
    const loadTime = performance.now() - startTime;

    // Rough estimate: 1ms load time ≈ 10KB
    return Math.round(loadTime * 10);
  } catch (error) {
    console.error('Failed to estimate component size:', error);
    return 0;
  }
}

/**
 * Critical CSS extraction helper
 */
export function extractCriticalCSS(html: string): string {
  // This is a placeholder - in production, use a library like 'critical'
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  return styleMatches ? styleMatches.join('\n') : '';
}

/**
 * Preconnect to external resources
 */
export function preconnectResources(urls: string[]): void {
  if (typeof document === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Prefetch DNS for external resources
 */
export function prefetchDNS(urls: string[]): void {
  if (typeof document === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

