/**
 * Error handling middleware for Next.js API routes
 * Provides consistent error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { APIError, ValidationError, toAPIError, isOperationalError } from './api-errors';

/**
 * Error handler wrapper for API route handlers
 * Catches and formats errors consistently
 * 
 * @param handler - The route handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```typescript
 * export const GET = withErrorHandler(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ data });
 * });
 * ```
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

/**
 * Handle and format errors
 * Converts errors to consistent API error responses
 * 
 * @param error - The error to handle
 * @param request - The Next.js request object
 * @returns Formatted error response
 */
function handleError(error: unknown, request: NextRequest): NextResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', {
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });

    logError(validationError, request);
    return createErrorResponse(validationError);
  }

  // Handle API errors
  if (error instanceof APIError) {
    logError(error, request);
    return createErrorResponse(error);
  }

  // Handle unknown errors
  const apiError = toAPIError(error);
  logError(apiError, request, error);
  return createErrorResponse(apiError);
}

/**
 * Create error response
 * Formats error as JSON response with appropriate status code
 * 
 * @param error - The API error
 * @returns Next.js response with error
 */
function createErrorResponse(error: APIError): NextResponse {
  const response = NextResponse.json(error.toJSON(), {
    status: error.statusCode,
  });

  // Add retry-after header for rate limit errors
  if (error.statusCode === 429 && 'retryAfter' in error) {
    const retryAfter = (error as { retryAfter?: number }).retryAfter;
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }
  }

  // Add correlation ID for tracking
  response.headers.set('X-Error-Id', generateErrorId());

  return response;
}

/**
 * Log error with context
 * Logs errors with request context for debugging
 * 
 * @param error - The API error to log
 * @param request - The Next.js request object
 * @param originalError - The original error (if different from API error)
 */
function logError(error: APIError, request: NextRequest, originalError?: unknown): void {
  const errorContext = {
    url: request.url,
    method: request.method,
    timestamp: error.timestamp,
    errorCode: error.code,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(originalError && { originalError }),
  };

  // Only log stack trace for non-operational errors
  if (!isOperationalError(error)) {
    console.error('Unexpected Error:', errorContext, error.stack);
  } else {
    console.warn('Operational Error:', errorContext);
  }

  // In production, you would send this to your error tracking service
  // e.g., Sentry, DataDog, New Relic, etc.
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService(errorContext);
  }
}

/**
 * Generate unique error ID for tracking
 * Creates a unique identifier for correlating errors across logs
 * 
 * @returns Unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Error response type
 * Used for type-safe error responses
 */
export interface ErrorResponseData {
  error: {
    message: string;
    code: number;
    status: number;
    timestamp: string;
    details?: unknown;
    retryAfter?: number;
  };
}

/**
 * Async error handler for non-route functions
 * Wraps async functions and converts errors to APIError
 * 
 * @param fn - Async function to wrap
 * @returns Wrapped function with error handling
 * 
 * @example
 * ```typescript
 * const safeFetch = asyncErrorHandler(async () => {
 *   return await fetchData();
 * });
 * ```
 */
export function asyncErrorHandler<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw toAPIError(error);
    }
  };
}

/**
 * Try-catch wrapper that returns result or error
 * Useful for handling errors without throwing
 * 
 * @param fn - Function to execute
 * @returns Result or API error
 * 
 * @example
 * ```typescript
 * const result = await safeExecute(async () => {
 *   return await riskyOperation();
 * });
 * 
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function safeExecute<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: APIError }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: toAPIError(error) };
  }
}

