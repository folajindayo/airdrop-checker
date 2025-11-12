/**
 * API response handling utilities
 * Provides consistent response formatting and error handling
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, PaginatedResponse, PaginationMetadata } from '@airdrop-finder/shared';

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Partial<ApiResponse['metadata']>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
  });
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: ApiError | string | Error,
  statusCode?: number
): NextResponse<ApiResponse> {
  let apiError: ApiError;
  
  if (typeof error === 'string') {
    apiError = {
      code: 'ERROR',
      message: error,
      statusCode: statusCode || 500,
      timestamp: Date.now(),
    };
  } else if (error instanceof Error) {
    apiError = {
      code: (error as any).code || 'INTERNAL_ERROR',
      message: error.message,
      statusCode: (error as any).statusCode || statusCode || 500,
      timestamp: Date.now(),
    };
  } else {
    apiError = {
      ...error,
      timestamp: error.timestamp || Date.now(),
    };
  }
  
  return NextResponse.json(
    {
      success: false,
      error: apiError,
      metadata: {
        timestamp: Date.now(),
      },
    },
    { status: apiError.statusCode || 500 }
  );
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMetadata
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data: items,
    pagination,
    metadata: {
      timestamp: Date.now(),
    },
  });
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  message: string,
  fields?: Record<string, string>
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: 'VALIDATION_ERROR',
    message,
    details: fields ? JSON.stringify(fields) : undefined,
    statusCode: 400,
    timestamp: Date.now(),
  });
}

/**
 * Create not found response
 */
export function createNotFoundResponse(
  resource: string
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: 'NOT_FOUND',
    message: `${resource} not found`,
    statusCode: 404,
    timestamp: Date.now(),
  });
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return createErrorResponse({
    code: 'UNAUTHORIZED',
    message,
    statusCode: 401,
    timestamp: Date.now(),
  });
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse> {
  const response = createErrorResponse({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    statusCode: 429,
    timestamp: Date.now(),
  });
  
  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter));
  }
  
  return response;
}

/**
 * Add cache headers to response
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  return response;
}

/**
 * Add no-cache headers to response
 */
export function addNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string = '*'
): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

