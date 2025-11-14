/**
 * @fileoverview CORS middleware for API routes
 * Handles Cross-Origin Resource Sharing configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '../config/env';

/**
 * CORS configuration options
 */
export interface CorsOptions {
  /** Allowed origins (domains) */
  origin?: string | string[] | ((origin: string) => boolean);
  /** Allowed HTTP methods */
  methods?: string[];
  /** Allowed headers */
  allowedHeaders?: string[];
  /** Exposed headers */
  exposedHeaders?: string[];
  /** Allow credentials */
  credentials?: boolean;
  /** Max age for preflight cache (seconds) */
  maxAge?: number;
  /** Allow all origins (development only) */
  allowAll?: boolean;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: Required<CorsOptions> = {
  origin: env.isDevelopment()
    ? '*'
    : [
        env.getAppUrl(),
        'https://airdrop-checker.vercel.app',
        'https://www.airdrop-checker.com',
      ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Client-Version',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Response-Time',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  allowAll: env.isDevelopment(),
};

/**
 * Check if origin is allowed based on CORS configuration
 */
function isOriginAllowed(
  origin: string | null,
  allowedOrigin: string | string[] | ((origin: string) => boolean)
): boolean {
  if (!origin) return false;

  if (typeof allowedOrigin === 'string') {
    return allowedOrigin === '*' || allowedOrigin === origin;
  }

  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin);
  }

  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(origin);
  }

  return false;
}

/**
 * Set CORS headers on response
 */
export function setCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  options: CorsOptions = {}
): NextResponse {
  const config = { ...defaultCorsOptions, ...options };

  // Get origin from request
  const origin = request.headers.get('origin');

  // Determine if origin is allowed
  const allowOrigin = config.allowAll
    ? '*'
    : origin && isOriginAllowed(origin, config.origin)
    ? origin
    : null;

  // Set Access-Control-Allow-Origin
  if (allowOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  }

  // Set Access-Control-Allow-Methods
  response.headers.set(
    'Access-Control-Allow-Methods',
    config.methods.join(', ')
  );

  // Set Access-Control-Allow-Headers
  response.headers.set(
    'Access-Control-Allow-Headers',
    config.allowedHeaders.join(', ')
  );

  // Set Access-Control-Expose-Headers
  if (config.exposedHeaders.length > 0) {
    response.headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', ')
    );
  }

  // Set Access-Control-Allow-Credentials
  if (config.credentials && allowOrigin !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set Access-Control-Max-Age
  response.headers.set('Access-Control-Max-Age', config.maxAge.toString());

  // Add Vary header to indicate response varies based on origin
  if (!config.allowAll) {
    response.headers.set('Vary', 'Origin');
  }

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) requests
 */
export function handlePreflight(
  request: NextRequest,
  options: CorsOptions = {}
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, request, options);
}

/**
 * CORS middleware wrapper for API routes
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: CorsOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, options);
    }

    try {
      // Execute the handler
      const response = await handler(request);

      // Add CORS headers to response
      return setCorsHeaders(response, request, options);
    } catch (error) {
      // Even on error, return response with CORS headers
      const errorResponse = NextResponse.json(
        {
          error: 'Internal Server Error',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
        { status: 500 }
      );

      return setCorsHeaders(errorResponse, request, options);
    }
  };
}

/**
 * Create CORS configuration for specific origins
 */
export function createCorsConfig(
  origins: string | string[],
  additionalOptions: Partial<CorsOptions> = {}
): CorsOptions {
  return {
    ...defaultCorsOptions,
    origin: origins,
    allowAll: false,
    ...additionalOptions,
  };
}

/**
 * Create CORS configuration for API key authentication
 */
export function createApiKeyCorsConfig(): CorsOptions {
  return {
    ...defaultCorsOptions,
    allowedHeaders: [
      ...defaultCorsOptions.allowedHeaders,
      'X-API-Key',
      'X-API-Secret',
    ],
    credentials: false, // API keys don't need credentials
  };
}

/**
 * Create CORS configuration for webhooks
 */
export function createWebhookCorsConfig(allowedDomains: string[]): CorsOptions {
  return {
    ...defaultCorsOptions,
    origin: allowedDomains,
    methods: ['POST', 'OPTIONS'],
    credentials: false,
    allowAll: false,
  };
}

/**
 * Validate and sanitize CORS configuration
 */
export function validateCorsConfig(config: CorsOptions): CorsOptions {
  const validated: CorsOptions = { ...config };

  // Ensure methods are uppercase
  if (validated.methods) {
    validated.methods = validated.methods.map((method) => method.toUpperCase());
  }

  // Remove duplicates from arrays
  if (validated.methods) {
    validated.methods = [...new Set(validated.methods)];
  }

  if (validated.allowedHeaders) {
    validated.allowedHeaders = [...new Set(validated.allowedHeaders)];
  }

  if (validated.exposedHeaders) {
    validated.exposedHeaders = [...new Set(validated.exposedHeaders)];
  }

  // Ensure maxAge is positive
  if (validated.maxAge !== undefined && validated.maxAge < 0) {
    validated.maxAge = 0;
  }

  // Can't use credentials with wildcard origin
  if (validated.credentials && validated.origin === '*') {
    validated.credentials = false;
  }

  return validated;
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(
  request: NextRequest,
  options: CorsOptions = {}
): boolean {
  const config = { ...defaultCorsOptions, ...options };
  const origin = request.headers.get('origin');

  if (config.allowAll) return true;
  if (!origin) return false;

  return isOriginAllowed(origin, config.origin);
}

/**
 * Get CORS headers as plain object (for testing)
 */
export function getCorsHeaders(
  origin: string | null,
  options: CorsOptions = {}
): Record<string, string> {
  const config = { ...defaultCorsOptions, ...options };

  const allowOrigin = config.allowAll
    ? '*'
    : origin && isOriginAllowed(origin, config.origin)
    ? origin
    : null;

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': config.methods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Max-Age': config.maxAge.toString(),
  };

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
  }

  if (config.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }

  if (config.credentials && allowOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (!config.allowAll) {
    headers['Vary'] = 'Origin';
  }

  return headers;
}

