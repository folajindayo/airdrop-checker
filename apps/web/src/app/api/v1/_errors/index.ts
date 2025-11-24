import { NextResponse } from 'next/server';

/**
 * Standard API error classes
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends APIError {
  constructor(retryAfter: number) {
    super(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(500, 'INTERNAL_ERROR', message);
    this.name = 'InternalServerError';
  }
}

export class BadGatewayError extends APIError {
  constructor(service: string) {
    super(502, 'BAD_GATEWAY', `Error communicating with ${service}`);
    this.name = 'BadGatewayError';
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(service: string) {
    super(503, 'SERVICE_UNAVAILABLE', `${service} is temporarily unavailable`);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: Error | APIError): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: error.statusCode }
    );
  }

  // Generic error
  const isDev = process.env.NODE_ENV === 'development';
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: isDev ? error.message : 'An unexpected error occurred',
        ...(isDev && error.stack && { stack: error.stack }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

/**
 * Error logger
 */
export function logError(error: Error | APIError, context?: Record<string, any>): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error instanceof APIError && {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }),
    ...context,
  };

  console.error('[API Error]', JSON.stringify(errorLog, null, 2));
}

