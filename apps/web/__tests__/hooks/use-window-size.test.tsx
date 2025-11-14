/**
 * @fileoverview Comprehensive tests for useWindowSize hook
 * Tests window dimension tracking and resize events
 */

import { renderHook, act } from '@testing-library/react';
import { useWindowSize } from '@/lib/hooks/use-window-size';

describe('useWindowSize', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Set initial window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe('Basic Functionality', () => {
    it('should return initial window dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it('should update dimensions on window resize', () => {
      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBe(1024);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });

    it('should handle multiple resize events', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1440,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 900,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1440);
      expect(result.current.height).toBe(900);
    });
  });

  describe('Different Window Sizes', () => {
    it('should handle mobile viewport', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 667,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('should handle tablet viewport', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
    });

    it('should handle desktop viewport', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });

    it('should handle ultra-wide viewport', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 3440,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1440,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(3440);
      expect(result.current.height).toBe(1440);
    });

    it('should handle very small viewport', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 320,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 568,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(320);
      expect(result.current.height).toBe(568);
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape', () => {
      const { result } = renderHook(() => useWindowSize());

      // Portrait
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 812,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(812);

      // Landscape
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 812,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 375,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(812);
      expect(result.current.height).toBe(375);
    });

    it('should handle landscape to portrait', () => {
      const { result } = renderHook(() => useWindowSize());

      // Landscape
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 768,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(1024);

      // Portrait
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
    });
  });

  describe('Cleanup', () => {
    it('should remove resize listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(
        window,
        'removeEventListener'
      );

      const { unmount } = renderHook(() => useWindowSize());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should not update state after unmount', () => {
      const { result, unmount } = renderHook(() => useWindowSize());

      const initialWidth = result.current.width;

      unmount();

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 2000,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Width should not have changed
      expect(result.current.width).toBe(initialWidth);
    });
  });

  describe('SSR/No Window', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useWindowSize());

      expect(result.current.width).toBeUndefined();
      expect(result.current.height).toBeUndefined();

      global.window = originalWindow;
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 0,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 0,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(0);
      expect(result.current.height).toBe(0);
    });

    it('should handle negative dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: -100,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: -100,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Browsers don't allow negative dimensions, but test handles it
      expect(result.current.width).toBe(-100);
      expect(result.current.height).toBe(-100);
    });

    it('should handle very large dimensions', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 10000,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 10000,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(10000);
      expect(result.current.height).toBe(10000);
    });

    it('should handle rapid resize events', () => {
      const { result } = renderHook(() => useWindowSize());

      act(() => {
        for (let i = 0; i < 100; i++) {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1000 + i,
          });
          window.dispatchEvent(new Event('resize'));
        }
      });

      expect(result.current.width).toBe(1099);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for responsive layout adjustments', () => {
      const { result } = renderHook(() => useWindowSize());

      const isMobile = result.current.width < 768;
      expect(isMobile).toBe(false);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        });
        window.dispatchEvent(new Event('resize'));
      });

      const isMobileNow = result.current.width < 768;
      expect(isMobileNow).toBe(true);
    });

    it('should work for sidebar collapse on small screens', () => {
      const { result } = renderHook(() => useWindowSize());

      const shouldCollapse = result.current.width < 1024;

      expect(shouldCollapse).toBe(false);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        });
        window.dispatchEvent(new Event('resize'));
      });

      const shouldCollapseNow = result.current.width < 1024;
      expect(shouldCollapseNow).toBe(true);
    });

    it('should work for grid column calculation', () => {
      const { result } = renderHook(() => useWindowSize());

      const getColumns = (width: number) => {
        if (width < 640) return 1;
        if (width < 1024) return 2;
        if (width < 1536) return 3;
        return 4;
      };

      expect(getColumns(result.current.width)).toBe(3);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(getColumns(result.current.width)).toBe(4);
    });

    it('should work for aspect ratio calculations', () => {
      const { result } = renderHook(() => useWindowSize());

      const aspectRatio = result.current.width / result.current.height;
      expect(aspectRatio).toBeCloseTo(1.333, 2);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1080,
        });
        window.dispatchEvent(new Event('resize'));
      });

      const newAspectRatio = result.current.width / result.current.height;
      expect(newAspectRatio).toBeCloseTo(1.778, 2);
    });

    it('should work for chart responsiveness', () => {
      const { result } = renderHook(() => useWindowSize());

      const getChartSize = (width: number, height: number) => ({
        width: width * 0.9,
        height: height * 0.6,
      });

      const initialChartSize = getChartSize(
        result.current.width,
        result.current.height
      );

      expect(initialChartSize.width).toBe(921.6);
      expect(initialChartSize.height).toBe(460.8);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1600,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 900,
        });
        window.dispatchEvent(new Event('resize'));
      });

      const newChartSize = getChartSize(
        result.current.width,
        result.current.height
      );

      expect(newChartSize.width).toBe(1440);
      expect(newChartSize.height).toBe(540);
    });
  });

  describe('Performance', () => {
    it('should not add multiple listeners on re-render', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      const { rerender } = renderHook(() => useWindowSize());

      const initialCallCount = addEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'resize'
      ).length;

      rerender();
      rerender();
      rerender();

      const finalCallCount = addEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'resize'
      ).length;

      expect(finalCallCount).toBe(initialCallCount);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Multiple Instances', () => {
    it('should work with multiple independent hooks', () => {
      const { result: result1 } = renderHook(() => useWindowSize());
      const { result: result2 } = renderHook(() => useWindowSize());

      expect(result1.current.width).toBe(result2.current.width);
      expect(result1.current.height).toBe(result2.current.height);

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1600,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result1.current.width).toBe(1600);
      expect(result2.current.width).toBe(1600);
    });

    it('should sync all instances on resize', () => {
      const { result: result1 } = renderHook(() => useWindowSize());
      const { result: result2 } = renderHook(() => useWindowSize());
      const { result: result3 } = renderHook(() => useWindowSize());

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 2000,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 1200,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result1.current).toEqual(result2.current);
      expect(result2.current).toEqual(result3.current);
    });
  });
});

