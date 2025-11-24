/**
 * useAsync Hook
 * 
 * A custom hook for managing async operations with loading, error, and data states.
 * Provides automatic cleanup and re-execution capabilities.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAsyncOptions<T> {
  /**
   * Initial data value
   */
  initialData?: T;
  
  /**
   * Whether to execute immediately on mount
   */
  immediate?: boolean;
  
  /**
   * Callback fired on success
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired on error
   */
  onError?: (error: Error) => void;
  
  /**
   * Dependencies that trigger re-execution
   */
  dependencies?: any[];
}

export interface UseAsyncReturn<T> {
  /**
   * The current data
   */
  data: T | undefined;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Execute the async function
   */
  execute: (...args: any[]) => Promise<T | undefined>;
  
  /**
   * Reset to initial state
   */
  reset: () => void;
  
  /**
   * Whether the operation has completed (success or error)
   */
  isComplete: boolean;
  
  /**
   * Whether the operation was successful
   */
  isSuccess: boolean;
  
  /**
   * Whether the operation resulted in an error
   */
  isError: boolean;
}

/**
 * useAsync Hook
 * 
 * Manages async operations with automatic state management.
 */
export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const {
    initialData,
    immediate = false,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      // Prevent multiple simultaneous executions
      if (loadingRef.current) {
        return undefined;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          loadingRef.current = false;
          onSuccess?.(result);
        }
        
        return result;
      } catch (err) {
        if (mountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          loadingRef.current = false;
          onError?.(error);
        }
        
        return undefined;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    loadingRef.current = false;
  }, [initialData]);

  // Execute immediately on mount or when dependencies change
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  const isComplete = !loading && (data !== undefined || error !== null);
  const isSuccess = !loading && data !== undefined && error === null;
  const isError = !loading && error !== null;

  return {
    data,
    loading,
    error,
    execute,
    reset,
    isComplete,
    isSuccess,
    isError,
  };
}

/**
 * useAsyncCallback Hook
 * 
 * Similar to useAsync but doesn't execute automatically.
 * Returns a memoized callback function.
 */
export function useAsyncCallback<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  dependencies: any[] = []
): [(...args: any[]) => Promise<T | undefined>, UseAsyncReturn<T>] {
  const asyncState = useAsync<T>(asyncFunction, {
    immediate: false,
  });

  // Memoize the execute function
  const callback = useCallback(
    (...args: any[]) => asyncState.execute(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncState.execute, ...dependencies]
  );

  return [callback, asyncState];
}

/**
 * useAsyncEffect Hook
 * 
 * Similar to useEffect but for async operations.
 */
export function useAsyncEffect<T = any>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): UseAsyncReturn<T> {
  return useAsync<T>(asyncFunction, {
    immediate: true,
    dependencies,
  });
}

