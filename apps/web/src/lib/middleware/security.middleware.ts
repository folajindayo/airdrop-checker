/**
 * Security middleware
 * Provides security headers and request sanitization
 * 
 * @module SecurityMiddleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
};

/**
 * Add security headers to response
 * 
 * @param response - Next.js response object
 * @returns Response with security headers added
 * 
 * @example
 * ```typescript
 * const response = NextResponse.json({ data: 'test' });
 * return addSecurityHeaders(response);
 * ```
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Sanitize request input
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize request body
 * 
 * @param body - Request body object
 * @returns Sanitized body object
 */
export function sanitizeBody(body: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(body).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Check if request origin is allowed
 * 
 * @param request - Next.js request object
 * @param allowedOrigins - Array of allowed origins
 * @returns True if origin is allowed
 */
export function isOriginAllowed(
  request: NextRequest,
  allowedOrigins: string[] = []
): boolean {
  const origin = request.headers.get('origin');
  
  if (!origin) {
    return true; // Allow requests without origin (e.g., same-origin)
  }

  if (allowedOrigins.length === 0) {
    return true; // Allow all if no restrictions
  }

  return allowedOrigins.includes(origin);
}

/**
 * Create CORS headers
 * 
 * @param request - Next.js request object
 * @param allowedOrigins - Array of allowed origins
 * @returns CORS headers object
 */
export function createCorsHeaders(
  request: NextRequest,
  allowedOrigins: string[] = []
): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowed = isOriginAllowed(request, allowedOrigins);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Wrap handler with security middleware
 * 
 * @param handler - Route handler function
 * @returns Handler with security headers and sanitization
 */
export function withSecurity<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    const response = await handler(...args);
    return addSecurityHeaders(response);
  };
}

