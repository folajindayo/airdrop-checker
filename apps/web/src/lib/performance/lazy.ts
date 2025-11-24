/**
 * Code splitting and lazy loading utilities
 */

import { lazy, ComponentType, LazyExoticComponent } from "react";

export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retrying with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000))
        );
      }
    }

    throw lastError || new Error("Failed to load component");
  });
}

export function lazyWithPreload<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  let Component: LazyExoticComponent<T> | null = null;
  let promise: Promise<{ default: T }> | null = null;

  const load = () => {
    if (!promise) {
      promise = componentImport();
    }
    return promise;
  };

  const LazyComponent = lazy(load) as LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };

  LazyComponent.preload = load;

  return LazyComponent;
}

export function preloadComponent<T extends ComponentType<any>>(
  component: LazyExoticComponent<T> & { preload?: () => void }
) {
  if (component.preload) {
    component.preload();
  }
}

export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return {
    Component: lazyWithPreload(importFn),
    preload: () => importFn(),
  };
}

interface LazyLoadOptions {
  delay?: number;
  threshold?: number;
}

export function lazyLoadOnVisible<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { delay = 0, threshold = 0.1 } = options;

  return lazy(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    return await componentImport();
  });
}

export function lazyLoadOnInteraction<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  eventType: keyof WindowEventMap = "mousemove"
): LazyExoticComponent<T> {
  let loaded = false;

  return lazy(async () => {
    if (!loaded) {
      return new Promise<{ default: T }>((resolve) => {
        const loadComponent = () => {
          loaded = true;
          window.removeEventListener(eventType, loadComponent);
          componentImport().then(resolve);
        };

        window.addEventListener(eventType, loadComponent, { once: true });
      });
    }

    return await componentImport();
  });
}

