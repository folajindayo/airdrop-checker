/**
 * Service Types
 * Common types shared across services
 */

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: ResponseMetadata;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: Date;
  duration?: number;
  cached?: boolean;
  source?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ServiceOptions {
  cache?: boolean;
  cacheTTL?: number;
  timeout?: number;
  retries?: number;
}

/**
 * Base service interface
 */
export interface IService {
  readonly name: string;
  initialize?(): Promise<void>;
  cleanup?(): Promise<void>;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * Service status
 */
export type ServiceStatus = 'initializing' | 'ready' | 'error' | 'stopped';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  lastCheck: Date;
  message?: string;
}

/**
 * Service event types
 */
export type ServiceEventType =
  | 'initialized'
  | 'error'
  | 'request'
  | 'response'
  | 'cache_hit'
  | 'cache_miss';

export interface ServiceEvent {
  type: ServiceEventType;
  service: string;
  timestamp: Date;
  data?: any;
}

/**
 * Service metrics
 */
export interface ServiceMetrics {
  requests: number;
  errors: number;
  avgResponseTime: number;
  cacheHitRate: number;
  lastRequest?: Date;
}

/**
 * Batch operation types
 */
export interface BatchRequest<T = any> {
  id: string;
  operation: string;
  params: T;
}

export interface BatchResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: ServiceError;
}

/**
 * Service dependencies
 */
export interface ServiceDependencies {
  cache?: boolean;
  database?: boolean;
  external?: string[];
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay?: number;
}

