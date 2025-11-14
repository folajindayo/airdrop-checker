/**
 * @fileoverview Comprehensive tests for useDebounce hook
 * Tests debouncing values and functions with various delays
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '@/lib/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Value Debouncing', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated' });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now value should be updated
      expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      // First update
      rerender({ value: 'update1' });
      
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current).toBe('initial');

      // Second update before delay completes
      rerender({ value: 'update2' });

      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Still should be initial
      expect(result.current).toBe('initial');

      // Complete the full delay
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should now have the latest value
      expect(result.current).toBe('update2');
    });

    it('should handle multiple rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 0 } }
      );

      // Simulate typing quickly
      for (let i = 1; i <= 10; i++) {
        rerender({ value: i });
        act(() => {
          jest.advanceTimersByTime(50);
        });
      }

      // Value should still be initial
      expect(result.current).toBe(0);

      // Wait for debounce to complete
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should have the last value
      expect(result.current).toBe(10);
    });

    it('should work with different data types', () => {
      // Number
      const { result: numberResult } = renderHook(() => useDebounce(42, 500));
      expect(numberResult.current).toBe(42);

      // Boolean
      const { result: boolResult } = renderHook(() => useDebounce(true, 500));
      expect(boolResult.current).toBe(true);

      // Object
      const obj = { key: 'value' };
      const { result: objResult } = renderHook(() => useDebounce(obj, 500));
      expect(objResult.current).toBe(obj);

      // Array
      const arr = [1, 2, 3];
      const { result: arrResult } = renderHook(() => useDebounce(arr, 500));
      expect(arrResult.current).toBe(arr);
    });

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Custom Delays', () => {
    it('should respect different delay values', () => {
      const { result: fast, rerender: rerenderFast } = renderHook(
        ({ value }) => useDebounce(value, 100),
        { initialProps: { value: 'initial' } }
      );

      const { result: slow, rerender: rerenderSlow } = renderHook(
        ({ value }) => useDebounce(value, 1000),
        { initialProps: { value: 'initial' } }
      );

      rerenderFast({ value: 'fast-update' });
      rerenderSlow({ value: 'slow-update' });

      // After 100ms, fast should update
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(fast.current).toBe('fast-update');
      expect(slow.current).toBe('initial');

      // After 1000ms total, slow should update
      act(() => {
        jest.advanceTimersByTime(900);
      });

      expect(slow.current).toBe('slow-update');
    });

    it('should allow delay to be changed', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 200 });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const { unmount } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      unmount();

      // Advancing timers should not cause errors
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });

    it('should cleanup previous timer on value change', () => {
      const { rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      // Create multiple timers
      rerender({ value: 'update1' });
      rerender({ value: 'update2' });
      rerender({ value: 'update3' });

      // Only the last timer should be active
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // No errors should occur from multiple timers
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values', () => {
      const { result } = renderHook(() => useDebounce(undefined, 500));
      expect(result.current).toBeUndefined();
    });

    it('should handle null values', () => {
      const { result } = renderHook(() => useDebounce(null, 500));
      expect(result.current).toBeNull();
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useDebounce('', 500));
      expect(result.current).toBe('');
    });

    it('should handle very large delays', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 10000),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle negative delays (treat as 0)', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, -100),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for search input debouncing', () => {
      const { result, rerender } = renderHook(
        ({ query }) => useDebounce(query, 300),
        { initialProps: { query: '' } }
      );

      // User types "react"
      const searchTerm = 'react';
      for (let i = 1; i <= searchTerm.length; i++) {
        rerender({ query: searchTerm.slice(0, i) });
        act(() => {
          jest.advanceTimersByTime(50);
        });
      }

      // Value should still be empty during typing
      expect(result.current).toBe('');

      // Wait for debounce to complete
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should have the full search term
      expect(result.current).toBe('react');
    });

    it('should work for form auto-save', () => {
      const { result, rerender } = renderHook(
        ({ formData }) => useDebounce(formData, 1000),
        { initialProps: { formData: { title: '', content: '' } } }
      );

      // User makes rapid changes
      rerender({ formData: { title: 'My Post', content: '' } });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      rerender({ formData: { title: 'My Post', content: 'Hello world' } });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      rerender({ formData: { title: 'My Post', content: 'Hello world!' } });
      
      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have the final state
      expect(result.current).toEqual({
        title: 'My Post',
        content: 'Hello world!',
      });
    });

    it('should work for window resize debouncing', () => {
      const { result, rerender } = renderHook(
        ({ width }) => useDebounce(width, 250),
        { initialProps: { width: 1024 } }
      );

      // Simulate rapid resize events
      const widths = [1024, 1020, 1015, 1010, 1005, 1000];
      widths.forEach((width) => {
        rerender({ width });
        act(() => {
          jest.advanceTimersByTime(50);
        });
      });

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(result.current).toBe(1000);
    });
  });

  describe('Performance', () => {
    it('should not create unnecessary re-renders', () => {
      let renderCount = 0;
      const { rerender } = renderHook(
        ({ value }) => {
          renderCount++;
          return useDebounce(value, 500);
        },
        { initialProps: { value: 'initial' } }
      );

      renderCount = 0; // Reset after initial render

      rerender({ value: 'updated' });
      expect(renderCount).toBe(1);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(renderCount).toBe(2); // Only one more for the debounced update
    });
  });
});

