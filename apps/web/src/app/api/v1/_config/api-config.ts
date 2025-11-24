/**
 * API v1 Configuration
 * Centralized configuration for all API v1 settings
 */

export const API_CONFIG = {
  version: '1.0.0',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  
  // Timeouts
  timeout: {
    default: 30000, // 30 seconds
    long: 60000, // 1 minute
    short: 10000, // 10 seconds
  },

  // Retry settings
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
    defaultPage: 1,
  },

  // Cache settings
  cache: {
    defaultTTL: 60000, // 1 minute
    longTTL: 300000, // 5 minutes
    shortTTL: 10000, // 10 seconds
  },

  // Rate limiting (requests per minute)
  rateLimit: {
    public: 100,
    authenticated: 1000,
    premium: 10000,
  },

  // Feature flags
  features: {
    enableCaching: true,
    enableRateLimiting: true,
    enableLogging: process.env.NODE_ENV === 'development',
    enableMetrics: true,
    enableAuth: false, // Set to true when authentication is ready
  },

  // CORS settings
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    maxAge: 86400, // 24 hours
  },

  // Security
  security: {
    apiKeyHeader: 'X-API-Key',
    requestIdHeader: 'X-Request-ID',
    enableCSRF: false,
    enableRateLimiting: true,
  },

  // Monitoring
  monitoring: {
    enableHealthCheck: true,
    enableMetrics: true,
    enableErrorTracking: true,
    healthCheckInterval: 60000, // 1 minute
  },

  // External services
  external: {
    goldRush: {
      apiKey: process.env.GOLDRUSH_API_KEY,
      baseUrl: 'https://api.covalenthq.com/v1',
      timeout: 30000,
    },
    database: {
      connectionString: process.env.DATABASE_URL,
      poolSize: 10,
    },
    redis: {
      url: process.env.REDIS_URL,
      enabled: !!process.env.REDIS_URL,
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.NODE_ENV === 'development',
    enableErrorLogging: true,
    enablePerformanceLogging: true,
  },
};

/**
 * Environment-specific overrides
 */
export function getAPIConfig(env: 'development' | 'production' | 'test' = 'production') {
  const config = { ...API_CONFIG };

  switch (env) {
    case 'development':
      config.features.enableLogging = true;
      config.logging.enableRequestLogging = true;
      break;
    
    case 'test':
      config.features.enableRateLimiting = false;
      config.features.enableCaching = false;
      break;
    
    case 'production':
      config.features.enableAuth = true;
      config.security.enableCSRF = true;
      break;
  }

  return config;
}

/**
 * Get environment
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as any) || 'production';
}

/**
 * Get current config
 */
export const currentConfig = getAPIConfig(getEnvironment());

