/**
 * usePagination Hook
 */

import { useState, useMemo } from 'react';

export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage = 20,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  const nextPage = () => {
    if (hasNext) setCurrentPage((p) => p + 1);
  };

  const previousPage = () => {
    if (hasPrevious) setCurrentPage((p) => p - 1);
  };

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    goToPage,
  };
}

