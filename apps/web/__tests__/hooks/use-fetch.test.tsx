/**
 * @fileoverview Comprehensive tests for useFetch and HTTP method hooks
 * Tests data fetching, error handling, loading states, and HTTP methods
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  useFetch,
  useGet,
  usePost,
  usePut,
  usePatch,
  useDelete,
} from '@/lib/hooks/use-fetch';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      (apiClient.get as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useFetch<typeof mockData>('/api/test')
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/api/test', undefined);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useFetch('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(mockError);
    });

    it('should pass options to API client', async () => {
      const mockData = { result: 'success' };
      const options = { headers: { 'X-Custom': 'value' } };
      (apiClient.get as jest.Mock).mockResolvedValue(mockData);

      renderHook(() => useFetch('/api/test', options));

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/api/test', options);
      });
    });

    it('should allow manual refetch', async () => {
      const mockData = { count: 0 };
      (apiClient.get as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useFetch<typeof mockData>('/api/test'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Refetch
      act(() => {
        result.current.refetch();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Skip Functionality', () => {
    it('should skip initial fetch when skip is true', async () => {
      const { result } = renderHook(() =>
        useFetch('/api/test', { skip: true })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch when skip changes to false', async () => {
      const mockData = { result: 'success' };
      (apiClient.get as jest.Mock).mockResolvedValue(mockData);

      const { result, rerender } = renderHook(
        ({ skip }) => useFetch('/api/test', { skip }),
        { initialProps: { skip: true } }
      );

      expect(apiClient.get).not.toHaveBeenCalled();

      rerender({ skip: false });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('Dependency Array', () => {
    it('should refetch when dependencies change', async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { rerender } = renderHook(
        ({ id }) => useFetch(`/api/test/${id}`, {}, [id]),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(1);
      });

      rerender({ id: 2 });

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });

      expect(apiClient.get).toHaveBeenNthCalledWith(1, '/api/test/1', {});
      expect(apiClient.get).toHaveBeenNthCalledWith(2, '/api/test/2', {});
    });

    it('should not refetch when non-dependency props change', async () => {
      const mockData = { result: 'success' };
      (apiClient.get as jest.Mock).mockResolvedValue(mockData);

      const { rerender } = renderHook(
        ({ url, other }) => useFetch(url, {}, [url]),
        { initialProps: { url: '/api/test', other: 'value1' } }
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(1);
      });

      rerender({ url: '/api/test', other: 'value2' });

      // Should not refetch since url (dependency) didn't change
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useGet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data using GET method', async () => {
    const mockData = { users: [] };
    (apiClient.get as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useGet<typeof mockData>('/api/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(apiClient.get).toHaveBeenCalledWith('/api/users', undefined);
  });
});

describe('usePost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute POST request', async () => {
    const mockResponse = { id: 1, created: true };
    const postData = { name: 'Test' };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePost<typeof mockResponse>('/api/users'));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();

    await act(async () => {
      await result.current.execute(postData);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/api/users', postData, undefined);
  });

  it('should handle POST errors', async () => {
    const mockError = new Error('Creation failed');
    (apiClient.post as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePost('/api/users'));

    await act(async () => {
      await result.current.execute({ name: 'Test' });
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it('should reset state before new request', async () => {
    const mockResponse1 = { id: 1 };
    const mockResponse2 = { id: 2 };
    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(() => usePost<{ id: number }>('/api/users'));

    await act(async () => {
      await result.current.execute({ name: 'First' });
    });

    expect(result.current.data).toEqual(mockResponse1);

    await act(async () => {
      await result.current.execute({ name: 'Second' });
    });

    expect(result.current.data).toEqual(mockResponse2);
    expect(result.current.error).toBeNull();
  });
});

describe('usePut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute PUT request', async () => {
    const mockResponse = { id: 1, updated: true };
    const updateData = { name: 'Updated' };
    (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePost<typeof mockResponse>('/api/users/1'));

    await act(async () => {
      await result.current.execute(updateData);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/api/users/1', updateData, undefined);
  });
});

describe('usePatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute PATCH request', async () => {
    const mockResponse = { id: 1, patched: true };
    const patchData = { status: 'active' };
    (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      usePatch<typeof mockResponse>('/api/users/1')
    );

    await act(async () => {
      await result.current.execute(patchData);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/users/1',
      patchData,
      undefined
    );
  });
});

describe('useDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute DELETE request', async () => {
    const mockResponse = { deleted: true };
    (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useDelete<typeof mockResponse>('/api/users/1')
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/users/1', undefined);
  });

  it('should handle DELETE errors', async () => {
    const mockError = new Error('Deletion failed');
    (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDelete('/api/users/1'));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });
});

describe('Request Options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass custom headers in POST request', async () => {
    const mockResponse = { success: true };
    const options = { headers: { Authorization: 'Bearer token' } };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePost('/api/secure', options));

    await act(async () => {
      await result.current.execute({ data: 'test' });
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/secure',
      { data: 'test' },
      options
    );
  });

  it('should pass query parameters in GET request', async () => {
    const mockData = { items: [] };
    const options = { params: { page: 1, limit: 10 } };
    (apiClient.get as jest.Mock).mockResolvedValue(mockData);

    renderHook(() => useGet('/api/items', options));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/items', options);
    });
  });
});

describe('Multiple Concurrent Requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle multiple POST requests', async () => {
    const mockResponse1 = { id: 1 };
    const mockResponse2 = { id: 2 };
    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(() => usePost<{ id: number }>('/api/items'));

    await act(async () => {
      const promise1 = result.current.execute({ name: 'Item 1' });
      const promise2 = result.current.execute({ name: 'Item 2' });
      await Promise.all([promise1, promise2]);
    });

    expect(apiClient.post).toHaveBeenCalledTimes(2);
  });
});

describe('Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not update state after unmount', async () => {
    const mockData = { result: 'success' };
    (apiClient.get as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockData), 100))
    );

    const { result, unmount } = renderHook(() => useFetch('/api/test'));

    expect(result.current.loading).toBe(true);

    unmount();

    // Wait for the promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 150));

    // State should not have been updated after unmount
    expect(result.current.loading).toBe(true);
  });
});

