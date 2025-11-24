/**
 * Error handling middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, toApiError, logError } from '@airdrop-finder/shared';
import { createErrorResponse } from '../utils/response-handlers';

/**
 * Wrap route handler with error handling
 */
export function withErrorHandler<T>(
  handler: (request: NextRequest, params: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, params: T): Promise<NextResponse> => {
    try {
      return await handler(request, params);
    } catch (error) {
      // Log error
      logError(error, {
        path: request.nextUrl.pathname,
        method: request.method,
      });
      
      // Return error response
      return createErrorResponse(error as Error);
    }
  };
}

/**
 * Async error boundary for route handlers
 */
export async function asyncHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      error instanceof Error ? error.message : 'Unknown error',
      'INTERNAL_ERROR',
      500
    );
  }
}

