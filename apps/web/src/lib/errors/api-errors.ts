/**
 * Standardized API error classes and error codes
 * Provides consistent error handling across all API routes
 */

/**
 * API Error Codes
 * Unique codes for different error scenarios
 */
export const API_ERROR_CODES = {
  // Validation Errors (1000-1999)
  VALIDATION_ERROR: 1000,
  INVALID_ADDRESS: 1001,
  INVALID_CHAIN_ID: 1002,
  INVALID_PARAMETERS: 1003,
  MISSING_REQUIRED_FIELD: 1004,
  
  // Authentication Errors (2000-2999)
  UNAUTHORIZED: 2000,
  INVALID_API_KEY: 2001,
  EXPIRED_TOKEN: 2002,
  INSUFFICIENT_PERMISSIONS: 2003,
  
  // Rate Limiting Errors (3000-3999)
  RATE_LIMIT_EXCEEDED: 3000,
  TOO_MANY_REQUESTS: 3001,
  QUOTA_EXCEEDED: 3002,
  
  // Resource Errors (4000-4999)
  NOT_FOUND: 4000,
  RESOURCE_NOT_FOUND: 4001,
  WALLET_NOT_FOUND: 4002,
  AIRDROP_NOT_FOUND: 4003,
  
  // External Service Errors (5000-5999)
  EXTERNAL_SERVICE_ERROR: 5000,
  GOLDRUSH_API_ERROR: 5001,
  DATABASE_ERROR: 5002,
  CACHE_ERROR: 5003,
  BLOCKCHAIN_RPC_ERROR: 5004,
  
  // Internal Errors (6000-6999)
  INTERNAL_SERVER_ERROR: 6000,
  CONFIGURATION_ERROR: 6001,
  UNEXPECTED_ERROR: 6002,
  
  // Business Logic Errors (7000-7999)
  INVALID_OPERATION: 7000,
  OPERATION_NOT_ALLOWED: 7001,
  DUPLICATE_REQUEST: 7002,
  STALE_DATA: 7003,
} as const;

/**
 * Base API Error class
 * All custom API errors extend this class
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: number,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        status: this.statusCode,
        timestamp: this.timestamp,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Validation Error (400)
 * Thrown when request validation fails
 */
export class ValidationError extends APIError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, API_ERROR_CODES.VALIDATION_ERROR, true, details);
  }
}

/**
 * Invalid Address Error (400)
 * Thrown when an invalid Ethereum address is provided
 */
export class InvalidAddressError extends APIError {
  constructor(address: string, details?: unknown) {
    super(
      `Invalid Ethereum address: ${address}`,
      400,
      API_ERROR_CODES.INVALID_ADDRESS,
      true,
      details
    );
  }
}

/**
 * Authentication Error (401)
 * Thrown when authentication fails
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 401, API_ERROR_CODES.UNAUTHORIZED, true, details);
  }
}

/**
 * Authorization Error (403)
 * Thrown when user lacks permissions
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions', details?: unknown) {
    super(message, 403, API_ERROR_CODES.INSUFFICIENT_PERMISSIONS, true, details);
  }
}

/**
 * Not Found Error (404)
 * Thrown when a resource is not found
 */
export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource', details?: unknown) {
    super(`${resource} not found`, 404, API_ERROR_CODES.NOT_FOUND, true, details);
  }
}

/**
 * Rate Limit Error (429)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, details?: unknown) {
    super(message, 429, API_ERROR_CODES.RATE_LIMIT_EXCEEDED, true, details);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    const json = super.toJSON();
    if (this.retryAfter) {
      json.error = {
        ...json.error,
        retryAfter: this.retryAfter,
      };
    }
    return json;
  }
}

/**
 * External Service Error (502)
 * Thrown when external service fails
 */
export class ExternalServiceError extends APIError {
  constructor(
    service: string,
    message: string = 'External service error',
    details?: unknown
  ) {
    super(`${service}: ${message}`, 502, API_ERROR_CODES.EXTERNAL_SERVICE_ERROR, true, details);
  }
}

/**
 * Database Error (503)
 * Thrown when database operation fails
 */
export class DatabaseError extends APIError {
  constructor(message: string = 'Database error', details?: unknown) {
    super(message, 503, API_ERROR_CODES.DATABASE_ERROR, true, details);
  }
}

/**
 * Internal Server Error (500)
 * Thrown for unexpected server errors
 */
export class InternalServerError extends APIError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, API_ERROR_CODES.INTERNAL_SERVER_ERROR, false, details);
  }
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is operational (expected error)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAPIError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert any error to APIError
 * Handles unknown errors and wraps them in APIError format
 */
export function toAPIError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new InternalServerError('An unexpected error occurred', {
    originalError: String(error),
  });
}

/**
 * Error response format
 * Standard structure for all API error responses
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: number;
    status: number;
    timestamp: string;
    details?: unknown;
    retryAfter?: number;
  };
}

