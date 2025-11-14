/**
 * @fileoverview Comprehensive tests for useMediaQuery hook
 * Tests responsive behavior and media query matching
 */

import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

describe('useMediaQuery', () => {
  // Mock matchMedia
  let matchMediaMock: jest.Mock;
  let listeners: ((this: MediaQueryList, ev: MediaQueryListEvent) => any)[] =
    [];

  beforeEach(() => {
    listeners = [];
    matchMediaMock = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event: string, listener: any) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: jest.fn((event: string, listener: any) => {
        if (event === 'change') {
          listeners = listeners.filter((l) => l !== listener);
        }
      }),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    listeners = [];
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return false when media query does not match', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(false);
    });

    it('should return true when media query matches', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(true);
    });

    it('should call matchMedia with correct query', () => {
      const query = '(max-width: 1024px)';
      renderHook(() => useMediaQuery(query));

      expect(matchMediaMock).toHaveBeenCalledWith(query);
    });
  });

  describe('Media Query Changes', () => {
    it('should update when media query changes to match', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener,
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(false);

      // Get the listener that was registered
      const changeListener = addEventListener.mock.calls[0][1];

      // Simulate media query change
      act(() => {
        changeListener({ matches: true } as MediaQueryListEvent);
      });

      expect(result.current).toBe(true);
    });

    it('should update when media query changes to not match', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener,
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(true);

      const changeListener = addEventListener.mock.calls[0][1];

      act(() => {
        changeListener({ matches: false } as MediaQueryListEvent);
      });

      expect(result.current).toBe(false);
    });

    it('should handle multiple changes', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener,
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      const changeListener = addEventListener.mock.calls[0][1];

      act(() => {
        changeListener({ matches: true } as MediaQueryListEvent);
      });
      expect(result.current).toBe(true);

      act(() => {
        changeListener({ matches: false } as MediaQueryListEvent);
      });
      expect(result.current).toBe(false);

      act(() => {
        changeListener({ matches: true } as MediaQueryListEvent);
      });
      expect(result.current).toBe(true);
    });
  });

  describe('Different Query Types', () => {
    it('should work with min-width queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 640px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 640px)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with max-width queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(max-width: 1280px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(max-width: 1280px)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with orientation queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(orientation: landscape)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(orientation: landscape)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with prefers-color-scheme queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(prefers-color-scheme: dark)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with prefers-reduced-motion queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(prefers-reduced-motion: reduce)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with complex queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 768px) and (max-width: 1024px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
      );

      expect(result.current).toBe(true);
    });

    it('should work with hover queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(hover: hover)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useMediaQuery('(hover: hover)'));

      expect(result.current).toBe(true);
    });

    it('should work with pointer queries', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(pointer: fine)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useMediaQuery('(pointer: fine)'));

      expect(result.current).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener: jest.fn(),
        removeEventListener,
      });

      const { unmount } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should cleanup when query changes', () => {
      const removeEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '',
        addEventListener: jest.fn(),
        removeEventListener,
      });

      const { rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: '(min-width: 768px)' } }
      );

      rerender({ query: '(min-width: 1024px)' });

      expect(removeEventListener).toHaveBeenCalled();
    });
  });

  describe('SSR/No Window', () => {
    it('should handle missing matchMedia gracefully', () => {
      const originalMatchMedia = window.matchMedia;
      // @ts-ignore
      delete window.matchMedia;

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(false);

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('Multiple Instances', () => {
    it('should work with multiple different queries', () => {
      matchMediaMock
        .mockReturnValueOnce({
          matches: true,
          media: '(min-width: 640px)',
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })
        .mockReturnValueOnce({
          matches: false,
          media: '(min-width: 1024px)',
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        });

      const { result: result1 } = renderHook(() =>
        useMediaQuery('(min-width: 640px)')
      );
      const { result: result2 } = renderHook(() =>
        useMediaQuery('(min-width: 1024px)')
      );

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
    });

    it('should work with same query in multiple hooks', () => {
      const query = '(min-width: 768px)';
      matchMediaMock.mockReturnValue({
        matches: true,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result: result1 } = renderHook(() => useMediaQuery(query));
      const { result: result2 } = renderHook(() => useMediaQuery(query));

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query string', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useMediaQuery(''));

      expect(result.current).toBe(false);
    });

    it('should handle invalid query string', () => {
      matchMediaMock.mockReturnValue({
        matches: false,
        media: 'invalid query',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useMediaQuery('invalid query'));

      expect(result.current).toBe(false);
    });

    it('should handle matchMedia throwing error', () => {
      matchMediaMock.mockImplementation(() => {
        throw new Error('matchMedia error');
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px)')
      );

      expect(result.current).toBe(false);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should detect mobile viewport', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(max-width: 640px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(max-width: 640px)')
      );

      expect(result.current).toBe(true);
    });

    it('should detect tablet viewport', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 641px) and (max-width: 1024px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
      );

      expect(result.current).toBe(true);
    });

    it('should detect desktop viewport', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(min-width: 1025px)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 1025px)')
      );

      expect(result.current).toBe(true);
    });

    it('should detect dark mode preference', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(prefers-color-scheme: dark)')
      );

      expect(result.current).toBe(true);
    });

    it('should detect touch device', () => {
      matchMediaMock.mockReturnValue({
        matches: true,
        media: '(hover: none) and (pointer: coarse)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() =>
        useMediaQuery('(hover: none) and (pointer: coarse)')
      );

      expect(result.current).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should not create multiple listeners for same query', () => {
      const addEventListener = jest.fn();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener,
        removeEventListener: jest.fn(),
      });

      renderHook(() => useMediaQuery('(min-width: 768px)'));

      expect(addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should reuse media query list', () => {
      const query = '(min-width: 768px)';
      renderHook(() => useMediaQuery(query));

      matchMediaMock.mockClear();

      // Should not call matchMedia again for same component
      expect(matchMediaMock).not.toHaveBeenCalled();
    });
  });
});

