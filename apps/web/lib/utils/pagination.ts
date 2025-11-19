export interface PageInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pageInfo: PageInfo;
}

export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): PaginatedData<T> {
  const totalCount = items.length;
  const pageCount = Math.ceil(totalCount / pageSize);
  const offset = (page - 1) * pageSize;

  const data = items.slice(offset, offset + pageSize);

  return {
    data,
    pageInfo: {
      page,
      pageSize,
      totalCount,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  };
}

export function getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
  const pages: number[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if near beginning or end
  if (currentPage <= halfVisible) {
    endPage = Math.min(totalPages, maxVisible);
  }

  if (currentPage + halfVisible >= totalPages) {
    startPage = Math.max(1, totalPages - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

