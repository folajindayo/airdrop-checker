/**
 * Security headers middleware
 * Implements security best practices for HTTP headers
 */

import { NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://api.covalenthq.com wss://*.walletconnect.com wss://*.walletconnect.org",
    "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org",
    "worker-src 'self' blob:",
  ].join('; '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

/**
 * Add security headers to response
 * 
 * @param response - NextResponse to add headers to
 * @returns Response with security headers
 * 
 * @example
 * ```typescript
 * const response = NextResponse.json({ data });
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
 * Create response with security headers
 * 
 * @param data - Response data
 * @param options - Response options
 * @returns Secure NextResponse
 * 
 * @example
 * ```typescript
 * return createSecureResponse({ success: true });
 * ```
 */
export function createSecureResponse<T>(
  data: T,
  options?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, options);
  return addSecurityHeaders(response);
}

/**
 * CORS configuration for API routes
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
} as const;

/**
 * Add CORS headers to response
 * 
 * @param response - NextResponse to add headers to
 * @returns Response with CORS headers
 */
export function addCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Handle OPTIONS preflight request
 * 
 * @returns Response for OPTIONS request
 */
export function handlePreflight(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCORSHeaders(response);
}

/**
 * Rate limit headers
 * 
 * @param limit - Total requests allowed
 * @param remaining - Remaining requests
 * @param reset - Unix timestamp when limit resets
 * @returns Headers object
 */
export function createRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

/**
 * Add rate limit headers to response
 * 
 * @param response - NextResponse
 * @param limit - Total requests allowed
 * @param remaining - Remaining requests
 * @param reset - Unix timestamp when limit resets
 * @returns Response with rate limit headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  const headers = createRateLimitHeaders(limit, remaining, reset);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create cache control headers
 * 
 * @param maxAge - Max age in seconds
 * @param sMaxAge - Shared cache max age
 * @param staleWhileRevalidate - Stale while revalidate period
 * @returns Cache-Control header value
 */
export function createCacheControlHeader(
  maxAge: number,
  sMaxAge?: number,
  staleWhileRevalidate?: number
): string {
  const parts = [`max-age=${maxAge}`];
  
  if (sMaxAge !== undefined) {
    parts.push(`s-maxage=${sMaxAge}`);
  }
  
  if (staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }
  
  return parts.join(', ');
}

/**
 * Add cache headers to response
 * 
 * @param response - NextResponse
 * @param maxAge - Max age in seconds
 * @param options - Cache options
 * @returns Response with cache headers
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number,
  options?: {
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    public?: boolean;
  }
): NextResponse {
  const cacheControl = createCacheControlHeader(
    maxAge,
    options?.sMaxAge,
    options?.staleWhileRevalidate
  );
  
  response.headers.set(
    'Cache-Control',
    options?.public ? `public, ${cacheControl}` : cacheControl
  );
  
  return response;
}

