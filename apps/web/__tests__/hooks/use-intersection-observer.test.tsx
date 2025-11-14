/**
 * @fileoverview Comprehensive tests for useIntersectionObserver hook
 * Tests element visibility detection and intersection changes
 */

import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useIntersectionObserver } from '@/lib/hooks/use-intersection-observer';

describe('useIntersectionObserver', () => {
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let observerCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    mockDisconnect = jest.fn();

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: () => [],
      };
    }) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    observerCallback = null;
  });

  describe('Basic Functionality', () => {
    it('should initialize with null entry', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      expect(result.current).toBeNull();
    });

    it('should observe element when ref is set', () => {
      const ref = { current: document.createElement('div') };
      renderHook(() => useIntersectionObserver(ref, {}));

      expect(mockObserve).toHaveBeenCalledWith(ref.current);
    });

    it('should not observe when ref is null', () => {
      const ref = { current: null };
      renderHook(() => useIntersectionObserver(ref, {}));

      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should update entry when intersection changes', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 1,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(true);
    });
  });

  describe('Options', () => {
    it('should pass root option to IntersectionObserver', () => {
      const ref = { current: document.createElement('div') };
      const root = document.createElement('div');

      renderHook(() => useIntersectionObserver(ref, { root }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ root })
      );
    });

    it('should pass rootMargin option to IntersectionObserver', () => {
      const ref = { current: document.createElement('div') };
      const rootMargin = '10px';

      renderHook(() => useIntersectionObserver(ref, { rootMargin }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin })
      );
    });

    it('should pass threshold option to IntersectionObserver', () => {
      const ref = { current: document.createElement('div') };
      const threshold = 0.5;

      renderHook(() => useIntersectionObserver(ref, { threshold }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold })
      );
    });

    it('should handle array threshold', () => {
      const ref = { current: document.createElement('div') };
      const threshold = [0, 0.25, 0.5, 0.75, 1];

      renderHook(() => useIntersectionObserver(ref, { threshold }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold })
      );
    });

    it('should handle multiple options together', () => {
      const ref = { current: document.createElement('div') };
      const root = document.createElement('div');
      const rootMargin = '20px';
      const threshold = 0.8;

      renderHook(() =>
        useIntersectionObserver(ref, { root, rootMargin, threshold })
      );

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ root, rootMargin, threshold })
      );
    });
  });

  describe('Cleanup', () => {
    it('should disconnect observer on unmount', () => {
      const ref = { current: document.createElement('div') };
      const { unmount } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should unobserve when ref changes', () => {
      const ref = { current: document.createElement('div') };
      const { rerender } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      ref.current = document.createElement('div');
      rerender();

      expect(mockUnobserve).toHaveBeenCalled();
    });

    it('should disconnect when options change', () => {
      const ref = { current: document.createElement('div') };
      const { rerender } = renderHook(
        ({ threshold }) => useIntersectionObserver(ref, { threshold }),
        { initialProps: { threshold: 0.5 } }
      );

      rerender({ threshold: 0.8 });

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Multiple Entries', () => {
    it('should handle multiple intersection changes', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      // First intersection
      const mockEntry1: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 0.5,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry1], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(true);
      expect(result.current?.intersectionRatio).toBe(0.5);

      // Second intersection
      const mockEntry2: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: false,
        intersectionRatio: 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry2], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(false);
      expect(result.current?.intersectionRatio).toBe(0);
    });

    it('should use first entry when multiple entries are provided', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      const mockEntry1: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      const mockEntry2: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: false,
        intersectionRatio: 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback(
          [mockEntry1, mockEntry2],
          {} as IntersectionObserver
        );
      }

      // Should use the first entry
      expect(result.current?.isIntersecting).toBe(true);
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle missing IntersectionObserver', () => {
      const originalObserver = global.IntersectionObserver;
      // @ts-ignore
      delete global.IntersectionObserver;

      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      expect(result.current).toBeNull();

      global.IntersectionObserver = originalObserver;
    });
  });

  describe('Edge Cases', () => {
    it('should handle ref becoming null', () => {
      const ref = { current: document.createElement('div') as HTMLElement | null };
      const { rerender } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      expect(mockObserve).toHaveBeenCalledTimes(1);

      ref.current = null;
      rerender();

      expect(mockUnobserve).toHaveBeenCalled();
    });

    it('should handle empty entries array', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      if (observerCallback) {
        observerCallback([], {} as IntersectionObserver);
      }

      // Should remain null
      expect(result.current).toBeNull();
    });

    it('should handle options as undefined', () => {
      const ref = { current: document.createElement('div') };
      renderHook(() => useIntersectionObserver(ref, undefined as any));

      expect(global.IntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should detect element entering viewport', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, { threshold: 0.1 })
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 0.1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(true);
    });

    it('should detect element leaving viewport', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      // First, enter viewport
      const entryIn: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([entryIn], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(true);

      // Then, leave viewport
      const entryOut: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: false,
        intersectionRatio: 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([entryOut], {} as IntersectionObserver);
      }

      expect(result.current?.isIntersecting).toBe(false);
    });

    it('should work for lazy loading images', () => {
      const ref = { current: document.createElement('img') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, { threshold: 0.01 })
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 0.01,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      // Image should be loaded when it enters viewport
      expect(result.current?.isIntersecting).toBe(true);
    });

    it('should work for infinite scroll', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, { rootMargin: '100px' })
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      // Sentinel element should trigger loading more items
      expect(result.current?.isIntersecting).toBe(true);
    });

    it('should work for scroll animations', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, { threshold: [0, 0.25, 0.5, 0.75, 1] })
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 0.5,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      // Element should animate based on intersection ratio
      expect(result.current?.intersectionRatio).toBe(0.5);
    });

    it('should work for tracking viewport visibility', () => {
      const ref = { current: document.createElement('div') };
      const { result } = renderHook(() =>
        useIntersectionObserver(ref, { threshold: 1 })
      );

      const mockEntry: IntersectionObserverEntry = {
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };

      if (observerCallback) {
        observerCallback([mockEntry], {} as IntersectionObserver);
      }

      // Element is fully visible
      expect(result.current?.intersectionRatio).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should create observer only once', () => {
      const ref = { current: document.createElement('div') };
      const { rerender } = renderHook(() =>
        useIntersectionObserver(ref, {})
      );

      const initialCallCount = (global.IntersectionObserver as jest.Mock).mock
        .calls.length;

      rerender();

      expect((global.IntersectionObserver as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });

    it('should not recreate observer for same options', () => {
      const ref = { current: document.createElement('div') };
      const options = { threshold: 0.5 };

      const { rerender } = renderHook(() =>
        useIntersectionObserver(ref, options)
      );

      const initialCallCount = (global.IntersectionObserver as jest.Mock).mock
        .calls.length;

      rerender();

      expect((global.IntersectionObserver as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });
  });
});

