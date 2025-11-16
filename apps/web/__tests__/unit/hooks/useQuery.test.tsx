/**
 * useQuery Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '../../../src/hooks/queries';

describe('useQuery', () => {
  it('should fetch data successfully', async () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useQuery('test-key', fetcher));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    const fetcher = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useQuery('test-key', fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it('should not fetch when enabled is false', () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'test' });
    renderHook(() => useQuery('test-key', fetcher, { enabled: false }));

    expect(fetcher).not.toHaveBeenCalled();
  });
});

