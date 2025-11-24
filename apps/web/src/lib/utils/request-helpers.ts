/**
 * Request parsing and validation helpers
 */

import { NextRequest } from 'next/server';
import type { PaginationParams, SortParams } from '@airdrop-finder/shared';

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get('page') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const cursor = searchParams.get('cursor') || undefined;
  
  return {
    page: isNaN(page) ? 0 : Math.max(0, page),
    limit: isNaN(limit) ? 10 : Math.min(Math.max(1, limit), 100),
    offset: isNaN(offset) ? 0 : Math.max(0, offset),
    cursor,
  };
}

/**
 * Parse sort parameters from request
 */
export function parseSortParams(
  request: NextRequest,
  defaultField: string = 'createdAt'
): SortParams {
  const searchParams = request.nextUrl.searchParams;
  
  const field = searchParams.get('sortBy') || defaultField;
  const order = searchParams.get('order') || 'desc';
  
  return {
    field,
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

/**
 * Parse array parameter from request
 */
export function parseArrayParam(
  request: NextRequest,
  key: string
): string[] {
  const searchParams = request.nextUrl.searchParams;
  const value = searchParams.get(key);
  
  if (!value) return [];
  
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * Parse boolean parameter from request
 */
export function parseBooleanParam(
  request: NextRequest,
  key: string,
  defaultValue: boolean = false
): boolean {
  const searchParams = request.nextUrl.searchParams;
  const value = searchParams.get(key);
  
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse number parameter from request
 */
export function parseNumberParam(
  request: NextRequest,
  key: string,
  defaultValue: number = 0
): number {
  const searchParams = request.nextUrl.searchParams;
  const value = searchParams.get(key);
  
  if (!value) return defaultValue;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get request body as JSON
 */
export async function getRequestBody<T = any>(
  request: NextRequest
): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    null
  );
}

/**
 * Get user agent
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}

/**
 * Check if request is from mobile device
 */
export function isMobileRequest(request: NextRequest): boolean {
  const ua = getUserAgent(request);
  if (!ua) return false;
  
  return /mobile|android|iphone|ipad|phone/i.test(ua);
}

/**
 * Get authorization header
 */
export function getAuthorizationHeader(request: NextRequest): string | null {
  return request.headers.get('authorization');
}

/**
 * Get bearer token from authorization header
 */
export function getBearerToken(request: NextRequest): string | null {
  const auth = getAuthorizationHeader(request);
  if (!auth) return null;
  
  const [type, token] = auth.split(' ');
  return type === 'Bearer' && token ? token : null;
}

/**
 * Get API key from header or query
 */
export function getApiKey(request: NextRequest): string | null {
  // Check header first
  const headerKey = request.headers.get('x-api-key');
  if (headerKey) return headerKey;
  
  // Check query parameter
  return request.nextUrl.searchParams.get('api_key');
}

/**
 * Get request ID from headers or generate new one
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}

/**
 * Parse filter parameters from request
 */
export function parseFilterParams(
  request: NextRequest,
  allowedKeys: string[]
): Record<string, any> {
  const searchParams = request.nextUrl.searchParams;
  const filters: Record<string, any> = {};
  
  allowedKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      filters[key] = value;
    }
  });
  
  return filters;
}

