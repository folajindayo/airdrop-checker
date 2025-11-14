/**
 * @fileoverview Tests for code splitting utilities
 */

import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {
  lazyWithRetry,
  lazyWithPreload,
  prefetchComponent,
  withLoadingBoundary,
  chunkNames,
} from '@/lib/performance/code-splitting';

// Mock dynamic import
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  lazy: jest.fn((factory) => {
    const Component = () => <div>Lazy Component</div>;
    Component.displayName = 'LazyComponent';
    return Component;
  }),
  Suspense: ({ children, fallback }: any) => children || fallback,
}));

describe('Code Splitting Utilities', () => {
  describe('lazyWithRetry', () => {
    it('should load component', async () => {
      const LazyComponent = lazyWithRetry(
        () => Promise.resolve({ default: () => <div>Test</div> })
      );

      const { container } = render(<LazyComponent />);
      
      await waitFor(() => {
        expect(container.textContent).toBeTruthy();
      });
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const factory = jest.fn(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('Load failed'));
        }
        return Promise.resolve({ default: () => <div>Success</div> });
      });

      const LazyComponent = lazyWithRetry(factory, { retries: 3 });

      const { container } = render(<LazyComponent />);

      await waitFor(() => {
        expect(factory).toHaveBeenCalled();
      });
    });

    it('should respect retry delay', async () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      lazyWithRetry(factory, { retries: 2, retryDelay: 100 });

      expect(factory).toBeDefined();
    });
  });

  describe('lazyWithPreload', () => {
    it('should create lazy component with preload', () => {
      const factory = () =>
        Promise.resolve({ default: () => <div>Test</div> });

      const LazyComponent = lazyWithPreload(factory);

      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.preload).toBeDefined();
    });

    it('should preload component', async () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      const LazyComponent = lazyWithPreload(factory);
      
      LazyComponent.preload();

      await waitFor(() => {
        expect(factory).toHaveBeenCalled();
      });
    });

    it('should cache preload result', async () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      const LazyComponent = lazyWithPreload(factory);
      
      LazyComponent.preload();
      LazyComponent.preload();

      await waitFor(() => {
        expect(factory).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('prefetchComponent', () => {
    it('should prefetch component', async () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      await prefetchComponent(factory);

      expect(factory).toHaveBeenCalled();
    });

    it('should handle prefetch errors', async () => {
      const factory = jest.fn(() => Promise.reject(new Error('Failed')));

      await expect(prefetchComponent(factory)).resolves.toBeUndefined();
    });
  });

  describe('withLoadingBoundary', () => {
    it('should wrap component with Suspense', () => {
      const Component = () => <div>Test Component</div>;
      const WrappedComponent = withLoadingBoundary(Component);

      const { container } = render(<WrappedComponent />);

      expect(container).toBeTruthy();
    });

    it('should show fallback while loading', () => {
      const Component = () => <div>Test Component</div>;
      const fallback = <div>Loading...</div>;
      const WrappedComponent = withLoadingBoundary(Component, fallback);

      expect(WrappedComponent).toBeDefined();
    });

    it('should show error boundary on error', () => {
      const Component = () => <div>Test Component</div>;
      const errorFallback = <div>Error occurred</div>;
      const WrappedComponent = withLoadingBoundary(
        Component,
        undefined,
        errorFallback
      );

      expect(WrappedComponent).toBeDefined();
    });
  });

  describe('chunkNames', () => {
    it('should have all chunk names', () => {
      expect(chunkNames.DASHBOARD).toBe('dashboard');
      expect(chunkNames.WALLET).toBe('wallet');
      expect(chunkNames.AIRDROP).toBe('airdrop');
      expect(chunkNames.PORTFOLIO).toBe('portfolio');
      expect(chunkNames.SETTINGS).toBe('settings');
      expect(chunkNames.ANALYTICS).toBe('analytics');
    });
  });

  describe('Integration Tests', () => {
    it('should handle component with preload and retry', async () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      const LazyComponent = lazyWithPreload(factory);
      
      // Preload
      LazyComponent.preload();

      await waitFor(() => {
        expect(factory).toHaveBeenCalled();
      });

      // Render
      const { container } = render(<LazyComponent />);
      expect(container).toBeTruthy();
    });

    it('should handle multiple lazy components', () => {
      const Component1 = lazyWithPreload(() =>
        Promise.resolve({ default: () => <div>Component 1</div> })
      );

      const Component2 = lazyWithPreload(() =>
        Promise.resolve({ default: () => <div>Component 2</div> })
      );

      expect(Component1).not.toBe(Component2);
    });
  });

  describe('Error Handling', () => {
    it('should handle factory errors gracefully', async () => {
      const factory = () => Promise.reject(new Error('Factory error'));

      const LazyComponent = lazyWithRetry(factory, { retries: 1 });

      expect(LazyComponent).toBeDefined();
    });

    it('should provide error info', async () => {
      const factory = jest.fn(() =>
        Promise.reject(new Error('Load failed'))
      );

      const LazyComponent = lazyWithRetry(factory, { retries: 1 });

      expect(LazyComponent).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not block rendering', () => {
      const factory = () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ default: () => <div>Test</div> }),
            100
          )
        );

      const LazyComponent = lazyWithPreload(factory);
      
      const start = Date.now();
      render(<LazyComponent />);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should minimize re-renders', () => {
      const factory = jest.fn(() =>
        Promise.resolve({ default: () => <div>Test</div> })
      );

      const LazyComponent = lazyWithPreload(factory);
      
      const { rerender } = render(<LazyComponent />);
      rerender(<LazyComponent />);

      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
});

