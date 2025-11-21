/**
 * Error Handler Middleware
 */

import { DomainError } from '../errors/domain.error';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export function errorHandlerMiddleware(error: Error): ErrorResponse {
  if (error instanceof DomainError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        field: 'field' in error ? (error as any).field : undefined,
      },
    };
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}

