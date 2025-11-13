/**
 * Standardized error handling utilities
 * Provides consistent error handling across the application
 */

import { NextResponse } from 'next/server';
import { createErrorResponse, createValidationErrorResponse } from './response-handlers';

/**
 * Error types for API responses
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return createErrorResponse(
      new Error(error.message),
      error.statusCode
    );
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return createValidationErrorResponse(error.message);
    }

    return createErrorResponse(error);
  }

  return createErrorResponse(
    new Error('An unexpected error occurred'),
    500
  );
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validate and throw AppError if invalid
 */
export function validateOrThrow(
  condition: boolean,
  message: string,
  code: ErrorCode = ErrorCode.VALIDATION_ERROR
): void {
  if (!condition) {
    throw new AppError(message, code, 400);
  }
}

