/**
 * API Response Utilities
 * 
 * Standardized API response formatting
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Success response
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  }
): NextResponse {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return successResponse(data, {
    pagination: {
      ...pagination,
      totalPages,
    },
  });
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse {
  return errorResponse('NOT_FOUND', message, 404);
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors: any): NextResponse {
  return errorResponse('VALIDATION_ERROR', 'Validation failed', 400, errors);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Rate limit response
 */
export function rateLimitResponse(message: string = 'Too many requests'): NextResponse {
  return errorResponse('RATE_LIMIT_EXCEEDED', message, 429);
}

