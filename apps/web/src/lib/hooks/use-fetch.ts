/**
 * useFetch Hook
 * 
 * A custom hook that combines useAsync with the API client for data fetching.
 * Provides automatic caching, refetching, and error handling.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, type RequestOptions } from '@/lib/api/client';
import { useAsync, type UseAsyncReturn } from './use-async';

export interface UseFetchOptions<T> extends RequestOptions {
  /**
   * Whether to fetch immediately on mount
   */
  enabled?: boolean;
  
  /**
   * Refetch interval in milliseconds
   */
  refetchInterval?: number;
  
  /**
   * Refetch on window focus
   */
  refetchOnFocus?: boolean;
  
  /**
   * Refetch on reconnect
   */
  refetchOnReconnect?: boolean;
  
  /**
   * Cache key for deduplication
   */
  cacheKey?: string;
  
  /**
   * Cache time in milliseconds
   */
  cacheTime?: number;
  
  /**
   * Initial data
   */
  initialData?: T;
  
  /**
   * Callback fired on success
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback fired on error
   */
  onError?: (error: Error) => void;
}

export interface UseFetchReturn<T> extends UseAsyncReturn<T> {
  /**
   * Refetch the data
   */
  refetch: () => Promise<T | undefined>;
  
  /**
   * Whether data is being refetched
   */
  isRefetching: boolean;
}

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * useFetch Hook
 * 
 * Fetches data from an API endpoint with caching and automatic refetching.
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    refetchOnFocus = false,
    refetchOnReconnect = false,
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    initialData,
    onSuccess,
    onError,
    ...requestOptions
  } = options;

  const [isRefetching, setIsRefetching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Check cache
  const getCachedData = useCallback((): T | undefined => {
    if (!cacheKey) return undefined;
    
    const cached = cache.get(cacheKey);
    if (!cached) return undefined;
    
    const isExpired = Date.now() - cached.timestamp > cacheTime;
    if (isExpired) {
      cache.delete(cacheKey);
      return undefined;
    }
    
    return cached.data;
  }, [cacheKey, cacheTime]);

  // Set cache
  const setCachedData = useCallback((data: T) => {
    if (cacheKey) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }
  }, [cacheKey]);

  // Fetch function
  const fetchData = useCallback(async (): Promise<T> => {
    if (!url) {
      throw new Error('URL is required');
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData !== undefined) {
      return cachedData;
    }

    const response = await api.get<T>(url, requestOptions);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data === undefined) {
      throw new Error('No data returned from API');
    }

    // Cache the result
    setCachedData(response.data);

    return response.data;
  }, [url, getCachedData, setCachedData, requestOptions]);

  // Use useAsync for state management
  const asyncState = useAsync<T>(fetchData, {
    initialData: initialData || getCachedData(),
    immediate: enabled && url !== null,
    onSuccess,
    onError,
  });

  // Refetch function
  const refetch = useCallback(async (): Promise<T | undefined> => {
    if (!isMountedRef.current) return undefined;
    
    setIsRefetching(true);
    const result = await asyncState.execute();
    setIsRefetching(false);
    
    return result;
  }, [asyncState]);

  // Setup refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled || url === null) return;

    intervalRef.current = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, url, refetch]);

  // Setup refetch on focus
  useEffect(() => {
    if (!refetchOnFocus || !enabled || url === null) return;

    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchOnFocus, enabled, url, refetch]);

  // Setup refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect || !enabled || url === null) return;

    const handleOnline = () => {
      refetch();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refetchOnReconnect, enabled, url, refetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...asyncState,
    refetch,
    isRefetching,
  };
}

/**
 * usePost Hook
 * 
 * Similar to useFetch but for POST requests.
 */
export function usePost<T = any, B = any>(
  url: string,
  options: Omit<UseFetchOptions<T>, 'refetchInterval' | 'refetchOnFocus' | 'refetchOnReconnect'> = {}
): [(body: B) => Promise<T | undefined>, UseAsyncReturn<T>] {
  const { onSuccess, onError, ...requestOptions } = options;

  const postData = useCallback(
    async (body: B): Promise<T> => {
      const response = await api.post<T>(url, body, requestOptions);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data === undefined) {
        throw new Error('No data returned from API');
      }

      return response.data;
    },
    [url, requestOptions]
  );

  const asyncState = useAsync<T>(postData, {
    immediate: false,
    onSuccess,
    onError,
  });

  const execute = useCallback(
    (body: B) => asyncState.execute(body),
    [asyncState.execute]
  );

  return [execute, asyncState];
}

/**
 * usePut Hook
 * 
 * Similar to useFetch but for PUT requests.
 */
export function usePut<T = any, B = any>(
  url: string,
  options: Omit<UseFetchOptions<T>, 'refetchInterval' | 'refetchOnFocus' | 'refetchOnReconnect'> = {}
): [(body: B) => Promise<T | undefined>, UseAsyncReturn<T>] {
  const { onSuccess, onError, ...requestOptions } = options;

  const putData = useCallback(
    async (body: B): Promise<T> => {
      const response = await api.put<T>(url, body, requestOptions);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data === undefined) {
        throw new Error('No data returned from API');
      }

      return response.data;
    },
    [url, requestOptions]
  );

  const asyncState = useAsync<T>(putData, {
    immediate: false,
    onSuccess,
    onError,
  });

  const execute = useCallback(
    (body: B) => asyncState.execute(body),
    [asyncState.execute]
  );

  return [execute, asyncState];
}

/**
 * useDelete Hook
 * 
 * Similar to useFetch but for DELETE requests.
 */
export function useDelete<T = any>(
  url: string,
  options: Omit<UseFetchOptions<T>, 'refetchInterval' | 'refetchOnFocus' | 'refetchOnReconnect'> = {}
): [() => Promise<T | undefined>, UseAsyncReturn<T>] {
  const { onSuccess, onError, ...requestOptions } = options;

  const deleteData = useCallback(
    async (): Promise<T> => {
      const response = await api.delete<T>(url, requestOptions);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data === undefined) {
        throw new Error('No data returned from API');
      }

      return response.data;
    },
    [url, requestOptions]
  );

  const asyncState = useAsync<T>(deleteData, {
    immediate: false,
    onSuccess,
    onError,
  });

  return [asyncState.execute, asyncState];
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key);
}

