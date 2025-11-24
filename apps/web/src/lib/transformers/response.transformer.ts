/**
 * Response data transformers
 */

export function transformPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: (page + 1) * limit < total,
    },
  };
}

export function transformTimestamps<T extends Record<string, any>>(
  data: T
): T {
  const transformed = { ...data };
  
  Object.keys(transformed).forEach((key) => {
    if (transformed[key] instanceof Date) {
      transformed[key] = transformed[key].toISOString();
    }
  });
  
  return transformed;
}

export function transformBigIntToString<T extends Record<string, any>>(
  data: T
): T {
  const transformed = { ...data };
  
  Object.keys(transformed).forEach((key) => {
    if (typeof transformed[key] === 'bigint') {
      transformed[key] = transformed[key].toString();
    }
  });
  
  return transformed;
}

