/**
 * Tests for useAsync Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync, useAsyncCallback, useAsyncEffect } from '@/lib/hooks/use-async';

describe('useAsync', () => {
  const mockAsyncFunction = jest.fn();

  beforeEach(() => {
    mockAsyncFunction.mockClear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      expect(result.current.data).toBeUndefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isComplete).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should use initial data when provided', () => {
      mockAsyncFunction.mockResolvedValue('data');
      
      const { result } = renderHook(() =>
        useAsync(mockAsyncFunction, { initialData: 'initial' })
      );

      expect(result.current.data).toBe('initial');
    });
  });

  describe('Execution', () => {
    it('should execute async function', async () => {
      mockAsyncFunction.mockResolvedValue('success');

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockAsyncFunction).toHaveBeenCalled();
      expect(result.current.data).toBe('success');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during execution', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      mockAsyncFunction.mockReturnValue(promise);

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!('data');
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should execute immediately when immediate is true', async () => {
      mockAsyncFunction.mockResolvedValue('immediate data');

      renderHook(() =>
        useAsync(mockAsyncFunction, { immediate: true })
      );

      await waitFor(() => {
        expect(mockAsyncFunction).toHaveBeenCalled();
      });
    });

    it('should not execute immediately by default', () => {
      mockAsyncFunction.mockResolvedValue('data');

      renderHook(() => useAsync(mockAsyncFunction));

      expect(mockAsyncFunction).not.toHaveBeenCalled();
    });
  });

  describe('Success Handling', () => {
    it('should set data on success', async () => {
      mockAsyncFunction.mockResolvedValue('success data');

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('success data');
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });

    it('should call onSuccess callback', async () => {
      const onSuccess = jest.fn();
      mockAsyncFunction.mockResolvedValue('data');

      const { result } = renderHook(() =>
        useAsync(mockAsyncFunction, { onSuccess })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith('data');
    });
  });

  describe('Error Handling', () => {
    it('should set error on failure', async () => {
      const error = new Error('Test error');
      mockAsyncFunction.mockRejectedValue(error);

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isError).toBe(true);
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const error = new Error('Test error');
      mockAsyncFunction.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useAsync(mockAsyncFunction, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should convert non-Error rejections to Error', async () => {
      mockAsyncFunction.mockRejectedValue('string error');

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', async () => {
      mockAsyncFunction.mockResolvedValue('data');

      const { result } = renderHook(() =>
        useAsync(mockAsyncFunction, { initialData: 'initial' })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('data');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe('initial');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should not update state after unmount', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      mockAsyncFunction.mockReturnValue(promise);

      const { result, unmount } = renderHook(() => useAsync(mockAsyncFunction));

      act(() => {
        result.current.execute();
      });

      unmount();

      await act(async () => {
        resolvePromise!('data');
        await promise;
      });

      // State should not change after unmount
      // No assertions needed, just ensuring no errors
    });
  });

  describe('Status Flags', () => {
    it('should set isComplete after success', async () => {
      mockAsyncFunction.mockResolvedValue('data');

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      expect(result.current.isComplete).toBe(false);

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isComplete).toBe(true);
    });

    it('should set isComplete after error', async () => {
      mockAsyncFunction.mockRejectedValue(new Error('error'));

      const { result } = renderHook(() => useAsync(mockAsyncFunction));

      expect(result.current.isComplete).toBe(false);

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Dependencies', () => {
    it('should re-execute when dependencies change', async () => {
      mockAsyncFunction.mockResolvedValue('data');

      const { rerender } = renderHook(
        ({ dep }) => useAsync(mockAsyncFunction, { immediate: true, dependencies: [dep] }),
        { initialProps: { dep: 1 } }
      );

      await waitFor(() => {
        expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
      });

      rerender({ dep: 2 });

      await waitFor(() => {
        expect(mockAsyncFunction).toHaveBeenCalledTimes(2);
      });
    });
  });
});

describe('useAsyncCallback', () => {
  const mockAsyncFunction = jest.fn();

  beforeEach(() => {
    mockAsyncFunction.mockClear();
  });

  it('should return callback and state', () => {
    mockAsyncFunction.mockResolvedValue('data');

    const { result } = renderHook(() => useAsyncCallback(mockAsyncFunction));

    expect(result.current).toHaveLength(2);
    expect(typeof result.current[0]).toBe('function');
    expect(result.current[1]).toHaveProperty('data');
    expect(result.current[1]).toHaveProperty('loading');
    expect(result.current[1]).toHaveProperty('error');
  });

  it('should execute via callback', async () => {
    mockAsyncFunction.mockResolvedValue('callback data');

    const { result } = renderHook(() => useAsyncCallback(mockAsyncFunction));

    const [execute, state] = result.current;

    await act(async () => {
      await execute();
    });

    expect(mockAsyncFunction).toHaveBeenCalled();
    expect(state.data).toBe('callback data');
  });

  it('should pass arguments to async function', async () => {
    mockAsyncFunction.mockResolvedValue('data');

    const { result } = renderHook(() => useAsyncCallback(mockAsyncFunction));

    const [execute] = result.current;

    await act(async () => {
      await execute('arg1', 'arg2');
    });

    expect(mockAsyncFunction).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('useAsyncEffect', () => {
  const mockAsyncFunction = jest.fn();

  beforeEach(() => {
    mockAsyncFunction.mockClear();
  });

  it('should execute immediately', async () => {
    mockAsyncFunction.mockResolvedValue('effect data');

    renderHook(() => useAsyncEffect(mockAsyncFunction));

    await waitFor(() => {
      expect(mockAsyncFunction).toHaveBeenCalled();
    });
  });

  it('should re-execute on dependency change', async () => {
    mockAsyncFunction.mockResolvedValue('data');

    const { rerender } = renderHook(
      ({ dep }) => useAsyncEffect(mockAsyncFunction, [dep]),
      { initialProps: { dep: 1 } }
    );

    await waitFor(() => {
      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
    });

    rerender({ dep: 2 });

    await waitFor(() => {
      expect(mockAsyncFunction).toHaveBeenCalledTimes(2);
    });
  });
});

