/**
 * @fileoverview Request logging middleware for API routes
 * Logs request details, response status, and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../monitoring/logger';
import { measurePerformance } from '../monitoring/performance';

/**
 * Request log entry interface
 */
export interface RequestLogEntry {
  /** Request ID for tracking */
  requestId: string;
  /** HTTP method */
  method: string;
  /** Request URL */
  url: string;
  /** Request path */
  path: string;
  /** Query parameters */
  query: Record<string, string | string[]>;
  /** Client IP address */
  ip: string | null;
  /** User agent */
  userAgent: string | null;
  /** Referer */
  referer: string | null;
  /** Request timestamp */
  timestamp: number;
  /** Response status code */
  status?: number;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Error message if request failed */
  error?: string;
  /** User ID if authenticated */
  userId?: string;
  /** API key if present */
  apiKey?: string;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Include request body in logs */
  logBody?: boolean;
  /** Include response body in logs */
  logResponse?: boolean;
  /** Include headers in logs */
  logHeaders?: boolean;
  /** Skip logging for specific paths */
  skipPaths?: string[];
  /** Skip logging for specific methods */
  skipMethods?: string[];
  /** Custom request ID generator */
  generateRequestId?: () => string;
  /** Custom log level function */
  getLogLevel?: (status: number) => 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Default logger options
 */
const defaultOptions: Required<LoggerOptions> = {
  logBody: false,
  logResponse: false,
  logHeaders: false,
  skipPaths: ['/api/health', '/api/metrics'],
  skipMethods: [],
  generateRequestId: () => crypto.randomUUID(),
  getLogLevel: (status) => {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warn';
    if (status >= 300) return 'info';
    return 'debug';
  },
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();

  return null;
}

/**
 * Parse query parameters from URL
 */
function parseQueryParams(url: URL): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  url.searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * Check if path should be skipped
 */
function shouldSkipLogging(
  request: NextRequest,
  options: LoggerOptions
): boolean {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const config = { ...defaultOptions, ...options };

  // Skip specific paths
  if (config.skipPaths.some((skipPath) => path.startsWith(skipPath))) {
    return true;
  }

  // Skip specific methods
  if (config.skipMethods.includes(method)) {
    return true;
  }

  return false;
}

/**
 * Create request log entry
 */
async function createRequestLogEntry(
  request: NextRequest,
  options: LoggerOptions = {}
): Promise<RequestLogEntry> {
  const config = { ...defaultOptions, ...options };
  const url = new URL(request.url);
  const requestId = config.generateRequestId();

  const entry: RequestLogEntry = {
    requestId,
    method: request.method,
    url: request.url,
    path: url.pathname,
    query: parseQueryParams(url),
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    timestamp: Date.now(),
  };

  // Add user ID if available (from auth header)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from token (simplified - would need actual JWT parsing)
    entry.userId = authHeader.substring(0, 20);
  }

  // Add API key if present
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    entry.apiKey = apiKey.substring(0, 10) + '...';
  }

  return entry;
}

/**
 * Update log entry with response data
 */
function updateLogEntry(
  entry: RequestLogEntry,
  response: NextResponse,
  startTime: number
): RequestLogEntry {
  const endTime = performance.now();

  entry.status = response.status;
  entry.responseTime = Math.round(endTime - startTime);

  // Try to get response size
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    entry.responseSize = parseInt(contentLength, 10);
  }

  return entry;
}

/**
 * Log request entry
 */
function logRequestEntry(entry: RequestLogEntry, options: LoggerOptions = {}): void {
  const config = { ...defaultOptions, ...options };

  if (!entry.status) {
    // Request log (before response)
    logger.info('Incoming request', {
      requestId: entry.requestId,
      method: entry.method,
      path: entry.path,
      ip: entry.ip,
      userAgent: entry.userAgent,
    });
    return;
  }

  // Response log
  const logLevel = config.getLogLevel(entry.status);
  const logData = {
    requestId: entry.requestId,
    method: entry.method,
    path: entry.path,
    status: entry.status,
    responseTime: `${entry.responseTime}ms`,
    ip: entry.ip,
  };

  if (entry.error) {
    logger[logLevel](`Request failed: ${entry.error}`, logData);
  } else {
    logger[logLevel](
      `Request completed - ${entry.method} ${entry.path} ${entry.status} ${entry.responseTime}ms`,
      logData
    );
  }
}

/**
 * Request logger middleware wrapper
 */
export function withRequestLogger(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: LoggerOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip logging if configured
    if (shouldSkipLogging(request, options)) {
      return handler(request);
    }

    const startTime = performance.now();

    try {
      // Create request log entry
      const logEntry = await createRequestLogEntry(request, options);

      // Log incoming request
      logRequestEntry(logEntry, options);

      // Add request ID to headers
      const requestWithId = new NextRequest(request, {
        headers: new Headers(request.headers),
      });
      requestWithId.headers.set('x-request-id', logEntry.requestId);

      // Execute handler
      const response = await handler(requestWithId);

      // Update log entry with response data
      const updatedEntry = updateLogEntry(logEntry, response, startTime);

      // Log response
      logRequestEntry(updatedEntry, options);

      // Add response headers
      response.headers.set('X-Request-ID', logEntry.requestId);
      response.headers.set('X-Response-Time', `${updatedEntry.responseTime}ms`);

      return response;
    } catch (error) {
      // Log error
      const logEntry = await createRequestLogEntry(request, options);
      logEntry.status = 500;
      logEntry.responseTime = Math.round(performance.now() - startTime);
      logEntry.error = error instanceof Error ? error.message : 'Unknown error';

      logRequestEntry(logEntry, options);

      // Re-throw error to be handled by error middleware
      throw error;
    }
  };
}

/**
 * Create custom logger with specific options
 */
export function createRequestLogger(
  options: LoggerOptions
): (
  handler: (request: NextRequest) => Promise<NextResponse>
) => (request: NextRequest) => Promise<NextResponse> {
  return (handler) => withRequestLogger(handler, options);
}

/**
 * Log request summary (for analytics/monitoring)
 */
export function logRequestSummary(entry: RequestLogEntry): void {
  const summary = {
    method: entry.method,
    path: entry.path,
    status: entry.status,
    responseTime: entry.responseTime,
    timestamp: entry.timestamp,
  };

  // Log to analytics/monitoring service
  logger.debug('Request summary', summary);
}

/**
 * Extract sensitive headers for logging
 */
export function getSafeHeaders(
  request: NextRequest
): Record<string, string> {
  const safeHeaders: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-api-secret'];

  request.headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      safeHeaders[key] = '[REDACTED]';
    } else {
      safeHeaders[key] = value;
    }
  });

  return safeHeaders;
}

/**
 * Format log entry for output
 */
export function formatLogEntry(entry: RequestLogEntry): string {
  const parts = [
    entry.method,
    entry.path,
    entry.status ? `${entry.status}` : '-',
    entry.responseTime ? `${entry.responseTime}ms` : '-',
    entry.ip || '-',
  ];

  return parts.join(' ');
}

/**
 * Parse request body safely
 */
export async function parseRequestBody(
  request: NextRequest
): Promise<unknown> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await request.json();
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const data: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      return data;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get request size in bytes
 */
export function getRequestSize(request: NextRequest): number | null {
  const contentLength = request.headers.get('content-length');
  return contentLength ? parseInt(contentLength, 10) : null;
}

/**
 * Check if request is from bot/crawler
 */
export function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'postman',
  ];

  return botPatterns.some((pattern) => userAgent.includes(pattern));
}

