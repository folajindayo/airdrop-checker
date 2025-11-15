/**
 * Database Query Helpers
 * 
 * Standardized query patterns and utilities
 */

/**
 * Pagination helper
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function getPaginationParams(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { skip, take };
}

/**
 * Build where clause for search
 */
export function buildSearchWhere(searchTerm?: string, fields: string[] = []) {
  if (!searchTerm || fields.length === 0) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Build orderBy clause
 */
export function buildOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  if (!sortBy) return { createdAt: sortOrder };
  return { [sortBy]: sortOrder };
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Batch query helper
 */
export async function batchQuery<T>(
  items: any[],
  batchSize: number,
  queryFn: (batch: any[]) => Promise<T[]>
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await queryFn(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Retry query with exponential backoff
 */
export async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Query failed after retries');
}

