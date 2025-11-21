/**
 * Query Optimizer
 */

export class QueryOptimizer {
  static optimizePagination(page: number, limit: number) {
    const maxLimit = 100;
    const safeLimit = Math.min(Math.max(1, limit), maxLimit);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    return { limit: safeLimit, offset, page: safePage };
  }

  static buildCacheKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  static shouldCache(result: any): boolean {
    return result && Object.keys(result).length > 0;
  }
}

