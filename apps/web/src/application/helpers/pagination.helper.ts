/**
 * Pagination Helper
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationHelper {
  static paginate<T>(
    items: T[],
    page: number,
    limit: number
  ): PaginationResult<T> {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = items.slice(start, end);

    return {
      items: paginatedItems,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static getTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }
}


