import { NextRequest } from 'next/server';

/**
 * API utility helpers
 */

/**
 * Extract pagination params from request
 */
export function getPaginationParams(req: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Extract sort params from request
 */
export function getSortParams(req: NextRequest): {
  field: string;
  order: 'asc' | 'desc';
} | null {
  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

  if (!sortBy) return null;

  return {
    field: sortBy,
    order: sortOrder || 'desc',
  };
}

/**
 * Extract filter params from request
 */
export function getFilterParams(
  req: NextRequest,
  allowedFilters: string[]
): Record<string, string> {
  const { searchParams } = new URL(req.url);
  const filters: Record<string, string> = {};

  allowedFilters.forEach((filter) => {
    const value = searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  });

  return filters;
}

/**
 * Parse address from URL
 */
export function parseAddressParam(address: string): string {
  // Remove leading/trailing whitespace
  address = address.trim();

  // Convert to lowercase for Ethereum addresses
  if (address.startsWith('0x')) {
    address = address.toLowerCase();
  }

  return address;
}

/**
 * Validate address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get client IP address
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'unknown'
  );
}

/**
 * Get user agent
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Check if request is from mobile device
 */
export function isMobileRequest(req: NextRequest): boolean {
  const ua = getUserAgent(req).toLowerCase();
  return /mobile|android|iphone|ipad|phone/i.test(ua);
}

/**
 * Parse request body safely
 */
export async function parseRequestBody<T = any>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Build cache key from request
 */
export function buildCacheKey(req: NextRequest, ...extra: string[]): string {
  const url = new URL(req.url);
  const parts = [
    req.method,
    url.pathname,
    url.search,
    ...extra,
  ];
  return parts.join(':');
}

/**
 * Parse time range parameter
 */
export function parseTimeRange(timeRange?: string): {
  start: Date;
  end: Date;
} {
  const end = new Date();
  let start = new Date();

  if (!timeRange) {
    // Default to 7 days
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  const match = timeRange.match(/^(\d+)([hdwmy])$/);
  if (!match) {
    // Invalid format, return default
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  const [, amount, unit] = match;
  const value = parseInt(amount);

  switch (unit) {
    case 'h': // hours
      start.setHours(start.getHours() - value);
      break;
    case 'd': // days
      start.setDate(start.getDate() - value);
      break;
    case 'w': // weeks
      start.setDate(start.getDate() - value * 7);
      break;
    case 'm': // months
      start.setMonth(start.getMonth() - value);
      break;
    case 'y': // years
      start.setFullYear(start.getFullYear() - value);
      break;
  }

  return { start, end };
}

/**
 * Sanitize query parameters
 */
export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Remove potentially dangerous characters
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/[<>]/g, '');
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Format API response time
 */
export function formatResponseTime(startTime: number): string {
  const duration = Date.now() - startTime;
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(2)}s`;
}

/**
 * Check if API is in maintenance mode
 */
export function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

/**
 * Get API version from request
 */
export function getAPIVersion(req: NextRequest): string {
  return req.headers.get('x-api-version') || '1.0.0';
}

