/**
 * @fileoverview Lazy loading utilities for images and components
 * @module lib/performance/lazy-loading
 */

import { useEffect, useRef, useState, RefObject } from 'react';

/**
 * Intersection observer options
 */
export interface LazyLoadOptions {
  /**
   * Root margin for intersection observer
   */
  rootMargin?: string;

  /**
   * Threshold for intersection
   */
  threshold?: number | number[];

  /**
   * Root element
   */
  root?: Element | null;

  /**
   * Callback when element becomes visible
   */
  onVisible?: () => void;

  /**
   * Load once and disconnect observer
   */
  once?: boolean;
}

/**
 * Use intersection observer for lazy loading
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: LazyLoadOptions = {}
): [RefObject<T>, boolean] {
  const {
    rootMargin = '50px',
    threshold = 0.01,
    root = null,
    onVisible,
    once = true,
  } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If already loaded and once=true, skip
    if (once && hasBeenInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;

        setIsInView(inView);

        if (inView) {
          setHasBeenInView(true);
          onVisible?.();

          if (once) {
            observer.disconnect();
          }
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, onVisible, once, hasBeenInView]);

  return [ref, once ? hasBeenInView : isInView];
}

/**
 * Lazy load image component
 */
export interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Image loading states
 */
type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Use lazy image loading
 */
export function useLazyImage(src: string): {
  imageSrc: string | undefined;
  state: ImageLoadingState;
} {
  const [imageSrc, setImageSrc] = useState<string>();
  const [state, setState] = useState<ImageLoadingState>('idle');

  useEffect(() => {
    if (!src) return;

    setState('loading');

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setState('loaded');
    };

    img.onerror = () => {
      setState('error');
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, state };
}

/**
 * Prefetch images
 */
export function prefetchImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        })
    )
  );
}

/**
 * Lazy load script
 */
export function lazyLoadScript(
  src: string,
  options: {
    async?: boolean;
    defer?: boolean;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = options.async ?? true;
    script.defer = options.defer ?? false;

    script.onload = () => {
      options.onLoad?.();
      resolve();
    };

    script.onerror = () => {
      const error = new Error(`Failed to load script: ${src}`);
      options.onError?.(error);
      reject(error);
    };

    document.body.appendChild(script);
  });
}

/**
 * Lazy load CSS
 */
export function lazyLoadCSS(
  href: string,
  options: {
    media?: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if stylesheet already exists
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = options.media || 'all';

    link.onload = () => {
      options.onLoad?.();
      resolve();
    };

    link.onerror = () => {
      const error = new Error(`Failed to load stylesheet: ${href}`);
      options.onError?.(error);
      reject(error);
    };

    document.head.appendChild(link);
  });
}

/**
 * Load resources in idle time
 */
export function loadInIdle(callback: () => void, timeout = 2000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Lazy load module
 */
export async function lazyLoadModule<T = any>(
  importFn: () => Promise<T>,
  options: {
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const { retries = 3, retryDelay = 1000 } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }

  throw new Error('Failed to load module after retries');
}

/**
 * Preload resource hint
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'font' | 'image' | 'fetch',
  options: {
    crossOrigin?: 'anonymous' | 'use-credentials';
    type?: string;
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  if (options.type) {
    link.type = options.type;
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resource hint
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
}

/**
 * Check if resource is loaded
 */
export function isResourceLoaded(
  url: string,
  type: 'script' | 'style' | 'img'
): boolean {
  if (typeof document === 'undefined') return false;

  switch (type) {
    case 'script':
      return !!document.querySelector(`script[src="${url}"]`);
    case 'style':
      return !!document.querySelector(`link[rel="stylesheet"][href="${url}"]`);
    case 'img':
      const img = document.querySelector(`img[src="${url}"]`) as HTMLImageElement;
      return img?.complete || false;
    default:
      return false;
  }
}

/**
 * Priority hints for resource loading
 */
export type PriorityHint = 'high' | 'low' | 'auto';

/**
 * Set resource priority
 */
export function setResourcePriority(
  element: HTMLLinkElement | HTMLScriptElement | HTMLImageElement,
  priority: PriorityHint
): void {
  if ('fetchPriority' in element) {
    (element as any).fetchPriority = priority;
  }
}

/**
 * Batch load resources
 */
export async function batchLoadResources(
  resources: Array<{
    type: 'script' | 'style' | 'img';
    url: string;
    priority?: PriorityHint;
  }>,
  concurrency = 3
): Promise<void> {
  const queue = [...resources];
  const loading: Promise<void>[] = [];

  const loadNext = async (): Promise<void> => {
    const resource = queue.shift();
    if (!resource) return;

    switch (resource.type) {
      case 'script':
        await lazyLoadScript(resource.url);
        break;
      case 'style':
        await lazyLoadCSS(resource.url);
        break;
      case 'img':
        await prefetchImages([resource.url]);
        break;
    }
  };

  while (queue.length > 0 || loading.length > 0) {
    while (loading.length < concurrency && queue.length > 0) {
      const promise = loadNext().then(() => {
        const index = loading.indexOf(promise);
        if (index !== -1) {
          loading.splice(index, 1);
        }
      });
      loading.push(promise);
    }

    if (loading.length > 0) {
      await Promise.race(loading);
    }
  }
}

