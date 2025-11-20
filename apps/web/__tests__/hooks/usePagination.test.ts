/**
 * usePagination Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../hooks/usePagination';

describe('usePagination', () => {
  it('should initialize with correct values', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, itemsPerPage: 10 })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrevious).toBe(false);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, itemsPerPage: 10 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should not exceed total pages', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, itemsPerPage: 10 })
    );

    act(() => {
      result.current.goToPage(15);
    });

    expect(result.current.currentPage).toBe(10);
  });
});

