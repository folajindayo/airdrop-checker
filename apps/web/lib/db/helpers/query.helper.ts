/**
 * Database query helpers
 */

export function buildPaginationQuery(page: number, limit: number) {
  return {
    skip: page * limit,
    take: limit,
  };
}

export function buildSortQuery(field: string, order: 'asc' | 'desc') {
  return {
    [field]: order,
  };
}

export function buildDateRangeQuery(startDate?: Date, endDate?: Date) {
  const query: any = {};
  
  if (startDate) {
    query.gte = startDate;
  }
  
  if (endDate) {
    query.lte = endDate;
  }
  
  return query;
}

export function buildSearchQuery(fields: string[], searchTerm: string) {
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    })),
  };
}

