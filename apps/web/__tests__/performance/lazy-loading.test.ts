/**
 * @fileoverview Tests for lazy loading utilities
 */

import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  useInView,
  useLazyImage,
  prefetchImages,
  lazyLoadScript,
  lazyLoadCSS,
  preloadResource,
  prefetchResource,
  isResourceLoaded,
} from '@/lib/performance/lazy-loading';

describe('Lazy Loading Utilities', () => {
  describe('useInView', () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = class IntersectionObserver {
        constructor(private callback: IntersectionObserverCallback) {}
        observe() {
          // Simulate immediate intersection
          this.callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as any
          );
        }
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;
    });

    it('should return ref and visibility state', () => {
      const { result } = renderHook(() => useInView());

      expect(result.current[0]).toHaveProperty('current');
      expect(typeof result.current[1]).toBe('boolean');
    });

    it('should detect when element is in view', async () => {
      const { result } = renderHook(() => useInView());

      await waitFor(() => {
        expect(result.current[1]).toBe(true);
      });
    });

    it('should call onVisible callback', async () => {
      const onVisible = jest.fn();
      const { result } = renderHook(() => useInView({ onVisible }));

      await waitFor(() => {
        expect(onVisible).toHaveBeenCalled();
      });
    });

    it('should support custom options', () => {
      const { result } = renderHook(() =>
        useInView({
          rootMargin: '100px',
          threshold: 0.5,
        })
      );

      expect(result.current[0]).toBeDefined();
    });
  });

  describe('useLazyImage', () => {
    beforeEach(() => {
      // Mock Image constructor
      global.Image = class {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          setTimeout(() => {
            this.onload?.();
          }, 0);
        }
      } as any;
    });

    it('should load image', async () => {
      const { result } = renderHook(() =>
        useLazyImage('https://example.com/image.jpg')
      );

      expect(result.current.state).toBe('loading');

      await waitFor(() => {
        expect(result.current.state).toBe('loaded');
        expect(result.current.imageSrc).toBe('https://example.com/image.jpg');
      });
    });

    it('should handle empty src', () => {
      const { result } = renderHook(() => useLazyImage(''));

      expect(result.current.state).toBe('idle');
    });
  });

  describe('prefetchImages', () => {
    beforeEach(() => {
      global.Image = class {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          setTimeout(() => {
            this.onload?.();
          }, 0);
        }
      } as any;
    });

    it('should prefetch multiple images', async () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ];

      await expect(prefetchImages(urls)).resolves.toBeDefined();
    });

    it('should handle empty array', async () => {
      await expect(prefetchImages([])).resolves.toEqual([]);
    });
  });

  describe('lazyLoadScript', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('should load script', async () => {
      const src = 'https://example.com/script.js';

      const promise = lazyLoadScript(src);

      // Simulate script load
      const script = document.querySelector('script');
      expect(script).toBeTruthy();
      expect(script?.src).toContain('script.js');

      script?.dispatchEvent(new Event('load'));

      await expect(promise).resolves.toBeUndefined();
    });

    it('should not load duplicate script', async () => {
      const src = 'https://example.com/script.js';

      // Add existing script
      const existingScript = document.createElement('script');
      existingScript.src = src;
      document.body.appendChild(existingScript);

      await lazyLoadScript(src);

      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBe(1);
    });

    it('should handle load error', async () => {
      const src = 'https://example.com/script.js';

      const promise = lazyLoadScript(src);

      const script = document.querySelector('script');
      script?.dispatchEvent(new Event('error'));

      await expect(promise).rejects.toThrow();
    });

    it('should support async and defer', async () => {
      const src = 'https://example.com/script.js';

      lazyLoadScript(src, { async: true, defer: true });

      const script = document.querySelector('script');
      expect(script?.async).toBe(true);
      expect(script?.defer).toBe(true);
    });
  });

  describe('lazyLoadCSS', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    it('should load CSS', async () => {
      const href = 'https://example.com/style.css';

      const promise = lazyLoadCSS(href);

      const link = document.querySelector('link');
      expect(link).toBeTruthy();
      expect(link?.href).toContain('style.css');

      link?.dispatchEvent(new Event('load'));

      await expect(promise).resolves.toBeUndefined();
    });

    it('should not load duplicate CSS', async () => {
      const href = 'https://example.com/style.css';

      const existingLink = document.createElement('link');
      existingLink.href = href;
      document.head.appendChild(existingLink);

      await lazyLoadCSS(href);

      const links = document.querySelectorAll('link');
      expect(links.length).toBe(1);
    });

    it('should support custom media', async () => {
      const href = 'https://example.com/print.css';

      lazyLoadCSS(href, { media: 'print' });

      const link = document.querySelector('link');
      expect(link?.media).toBe('print');
    });
  });

  describe('preloadResource', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    it('should add preload link', () => {
      preloadResource('https://example.com/font.woff2', 'font');

      const link = document.querySelector('link[rel="preload"]');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('as')).toBe('font');
    });

    it('should not duplicate preload', () => {
      const href = 'https://example.com/font.woff2';

      preloadResource(href, 'font');
      preloadResource(href, 'font');

      const links = document.querySelectorAll('link[rel="preload"]');
      expect(links.length).toBe(1);
    });

    it('should support cross-origin', () => {
      preloadResource('https://example.com/font.woff2', 'font', {
        crossOrigin: 'anonymous',
      });

      const link = document.querySelector('link[rel="preload"]');
      expect(link?.getAttribute('crossorigin')).toBe('anonymous');
    });
  });

  describe('prefetchResource', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    it('should add prefetch link', () => {
      prefetchResource('https://example.com/next-page.html');

      const link = document.querySelector('link[rel="prefetch"]');
      expect(link).toBeTruthy();
    });

    it('should not duplicate prefetch', () => {
      const href = 'https://example.com/next-page.html';

      prefetchResource(href);
      prefetchResource(href);

      const links = document.querySelectorAll('link[rel="prefetch"]');
      expect(links.length).toBe(1);
    });
  });

  describe('isResourceLoaded', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      document.head.innerHTML = '';
    });

    it('should detect loaded script', () => {
      const script = document.createElement('script');
      script.src = 'https://example.com/script.js';
      document.body.appendChild(script);

      expect(isResourceLoaded('https://example.com/script.js', 'script')).toBe(true);
    });

    it('should detect loaded stylesheet', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/style.css';
      document.head.appendChild(link);

      expect(isResourceLoaded('https://example.com/style.css', 'style')).toBe(true);
    });

    it('should return false for unloaded resource', () => {
      expect(isResourceLoaded('https://example.com/missing.js', 'script')).toBe(false);
    });
  });
});

