/**
 * API-specific types for the Airdrop Finder application
 * Standardizes request/response formats across all endpoints
 * @module types/api
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string | Record<string, any>;
  statusCode?: number;
  timestamp?: number;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  timestamp: number;
  cached?: boolean;
  cacheExpiry?: number;
  requestId?: string;
  version?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Pagination metadata in responses
 */
export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMetadata;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

/**
 * Request validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Batch request wrapper
 */
export interface BatchRequest<T> {
  operations: T[];
  parallel?: boolean;
  stopOnError?: boolean;
}

/**
 * Batch response wrapper
 */
export interface BatchResponse<T> {
  results: BatchResult<T>[];
  summary: BatchSummary;
}

/**
 * Individual batch operation result
 */
export interface BatchResult<T> {
  index: number;
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Batch operation summary
 */
export interface BatchSummary {
  total: number;
  successful: number;
  failed: number;
  duration?: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * API request context
 */
export interface RequestContext {
  requestId: string;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
  path: string;
  method: string;
}

/**
 * Health check response
 */
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  services?: ServiceHealth[];
}

/**
 * Service health status
 */
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
}

