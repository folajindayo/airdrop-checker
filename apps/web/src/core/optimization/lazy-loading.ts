/**
 * Lazy Loading Utilities
 * Code splitting and lazy component loading
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  maxRetries: number = 3
): ReturnType<typeof lazy> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load component (attempt ${i + 1}/${maxRetries})`);
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  });
}

/**
 * Preload component
 */
export function preloadComponent(componentImport: () => Promise<any>): void {
  componentImport().catch(error => {
    console.error('Failed to preload component:', error);
  });
}

/**
 * Create route-based code splitting
 */
export const LazyComponents = {
  Dashboard: lazyWithRetry(() => import('../../app/dashboard/page')),
  Portfolio: lazyWithRetry(() => import('../../app/portfolio/page')),
  Compare: lazyWithRetry(() => import('../../app/compare/page')),
  Settings: lazyWithRetry(() => import('../../app/settings/page')),
};

