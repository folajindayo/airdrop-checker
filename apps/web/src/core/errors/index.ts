/**
 * Error handling utilities
 * Provides standardized error handling across the application
 * @module core/errors
 */

/**
 * API Error interface
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: number;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: number;
  
  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = Date.now();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;
  
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fields = fields;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;
  
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
  public readonly service: string;
  
  constructor(service: string, message: string) {
    super(`External API error from ${service}: ${message}`, 'EXTERNAL_API_ERROR', 502);
    this.service = service;
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

/**
 * Cache error
 */
export class CacheError extends AppError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR', 500, false);
  }
}

/**
 * Check if error is operational (expected)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert unknown error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return error.toJSON();
  }
  
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500,
      timestamp: Date.now(),
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    statusCode: 500,
    timestamp: Date.now(),
  };
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Safe error code extraction
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  if (error instanceof Error) {
    return 'INTERNAL_ERROR';
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Safe error status code extraction
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Create error response object
 */
export function createErrorResponse(
  error: unknown,
  includeStack: boolean = false
): {
  error: ApiError;
  stack?: string;
} {
  const apiError = toApiError(error);
  const response: { error: ApiError; stack?: string } = { error: apiError };
  
  if (includeStack && error instanceof Error && error.stack) {
    response.stack = error.stack;
  }
  
  return response;
}

/**
 * Wrap async function with error handling
 */
export function wrapAsyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Error in async handler:', error);
      throw error;
    }
  }) as T;
}

/**
 * Assert condition or throw error
 */
export function assert(
  condition: boolean,
  message: string,
  ErrorClass: typeof AppError = AppError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Assert value is not null/undefined or throw error
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(message);
  }
}

/**
 * Try-catch wrapper that returns [error, null] or [null, result]
 */
export async function tryCatch<T>(
  promise: Promise<T>
): Promise<[Error, null] | [null, T]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T = any>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context?: Record<string, any>
): void {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    statusCode: getErrorStatusCode(error),
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  console.error('Error occurred:', errorInfo);
  
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

