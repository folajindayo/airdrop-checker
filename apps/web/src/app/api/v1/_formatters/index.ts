import { NextResponse } from 'next/server';

/**
 * Standard API response formatters
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Format success response
 */
export function formatSuccessResponse<T>(
  data: T,
  options?: {
    version?: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  }
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: options?.version || '1.0.0',
      ...(options?.requestId && { requestId: options.requestId }),
    },
  };

  if (options?.pagination) {
    const { page, limit, total } = options.pagination;
    response.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  return NextResponse.json(response);
}

/**
 * Format error response
 */
export function formatErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any
): NextResponse {
  const response: APIResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return formatSuccessResponse(items, {
    pagination: { page, limit, total },
  });
}

/**
 * Format collection response
 */
export function formatCollectionResponse<T>(
  items: T[],
  options?: {
    total?: number;
    filters?: Record<string, any>;
    sort?: { field: string; order: 'asc' | 'desc' };
  }
): NextResponse {
  return NextResponse.json({
    success: true,
    data: {
      items,
      count: items.length,
      ...(options?.total !== undefined && { total: options.total }),
      ...(options?.filters && { filters: options.filters }),
      ...(options?.sort && { sort: options.sort }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
}

/**
 * Format single resource response
 */
export function formatResourceResponse<T>(resource: T | null): NextResponse {
  if (!resource) {
    return formatErrorResponse('NOT_FOUND', 'Resource not found', 404);
  }

  return formatSuccessResponse(resource);
}

/**
 * Format empty response (204 No Content)
 */
export function formatEmptyResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Format validation error response
 */
export function formatValidationErrorResponse(errors: Record<string, string>): NextResponse {
  return formatErrorResponse(
    'VALIDATION_ERROR',
    'Validation failed',
    400,
    { fields: errors }
  );
}

/**
 * Response headers utilities
 */
export function addCacheHeaders(response: NextResponse, maxAge: number): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
  return response;
}

export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

/**
 * Data transformation utilities
 */
export const transform = {
  /**
   * Transform database timestamps to ISO strings
   */
  timestamps: (obj: any): any => {
    if (!obj) return obj;
    return {
      ...obj,
      ...(obj.createdAt && { createdAt: new Date(obj.createdAt).toISOString() }),
      ...(obj.updatedAt && { updatedAt: new Date(obj.updatedAt).toISOString() }),
    };
  },

  /**
   * Remove sensitive fields from response
   */
  sanitize: (obj: any, fields: string[]): any => {
    if (!obj) return obj;
    const sanitized = { ...obj };
    fields.forEach(field => delete sanitized[field]);
    return sanitized;
  },

  /**
   * Transform keys to camelCase
   */
  toCamelCase: (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(transform.toCamelCase);

    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = typeof value === 'object' ? transform.toCamelCase(value) : value;
      return acc;
    }, {} as any);
  },

  /**
   * Transform keys to snake_case
   */
  toSnakeCase: (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(transform.toSnakeCase);

    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = typeof value === 'object' ? transform.toSnakeCase(value) : value;
      return acc;
    }, {} as any);
  },
};

