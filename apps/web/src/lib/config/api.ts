/**
 * API configuration
 * Centralizes all API-related configuration
 */

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Airdrop endpoints
  AIRDROP_CHECK: '/api/airdrop-check',
  AIRDROPS: '/api/airdrops',
  AIRDROPS_TRENDING: '/api/airdrops/trending',
  AIRDROPS_HIGHLIGHTS: '/api/airdrops/highlights',
  
  // Portfolio endpoints
  PORTFOLIO: '/api/portfolio',
  PORTFOLIO_PERFORMANCE: '/api/portfolio-performance',
  PORTFOLIO_COMPARE: '/api/portfolio/compare',
  MULTI_WALLET_PORTFOLIO: '/api/multi-wallet-portfolio',
  
  // Analytics endpoints
  GAS_TRACKER: '/api/gas-tracker',
  GAS_OPTIMIZER: '/api/gas-optimizer',
  GAS_HISTORY: '/api/gas-history',
  PROTOCOL_INSIGHTS: '/api/protocol-insights',
  PROTOCOL_HEATMAP: '/api/protocol-heatmap',
  WALLET_HEALTH: '/api/wallet-health',
  
  // Risk and analysis
  RISK_ANALYSIS: '/api/risk-analysis',
  RISK_ANALYZER: '/api/risk-analyzer',
  RISK_CALCULATOR: '/api/risk-calculator',
  CONTRACT_ANALYZER: '/api/contract-analyzer',
  WALLET_CLUSTERING: '/api/wallet-clustering',
  
  // Transaction endpoints
  TRANSACTION_SIMULATOR: '/api/transaction-simulator',
  TRANSACTION_ANALYZER: '/api/transaction-analyzer',
  
  // Strategy endpoints
  FARMING_STRATEGY: '/api/farming-strategy',
  ROI_CALCULATOR: '/api/roi-calculator',
  PROBABILITY_PREDICTOR: '/api/probability-predictor',
  
  // Utility endpoints
  EXPORT_DATA: '/api/export-data',
  CALENDAR_EXPORT: '/api/calendar-export',
  REFRESH: '/api/refresh',
  COMPARE: '/api/compare',
  
  // User endpoints
  ALERTS: '/api/alerts',
  NOTIFICATIONS: '/api/notifications',
  PREFERENCES: '/api/preferences',
  LEADERBOARD: '/api/leaderboard',
} as const;

/**
 * API timeout configuration (in milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000, // 1 minute
  SHORT: 10000, // 10 seconds
  BATCH: 120000, // 2 minutes
} as const;

/**
 * API retry configuration
 */
export const API_RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
  AIRDROP_CHECK: {
    points: 10,
    duration: 60, // seconds
  },
  REFRESH: {
    points: 1,
    duration: 300, // 5 minutes
  },
  EXPORT: {
    points: 5,
    duration: 60,
  },
  DEFAULT: {
    points: 100,
    duration: 60,
  },
} as const;

/**
 * Cache TTL configuration (in milliseconds)
 */
export const CACHE_TTL = {
  AIRDROP_CHECK: 60 * 60 * 1000, // 1 hour
  AIRDROPS_LIST: 5 * 60 * 1000, // 5 minutes
  PORTFOLIO: 5 * 60 * 1000, // 5 minutes
  GAS_TRACKER: 5 * 60 * 1000, // 5 minutes
  PROTOCOL_INSIGHTS: 10 * 60 * 1000, // 10 minutes
  WALLET_HEALTH: 10 * 60 * 1000, // 10 minutes
  TRENDING: 2 * 60 * 1000, // 2 minutes
  HIGHLIGHTS: 2 * 60 * 1000, // 2 minutes
} as const;

/**
 * Pagination configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 0,
} as const;

/**
 * Batch operation configuration
 */
export const BATCH_CONFIG = {
  MAX_BATCH_SIZE: 50,
  DEFAULT_CONCURRENCY: 5,
  STOP_ON_ERROR: false,
} as const;

/**
 * GoldRush API configuration
 */
export const GOLDRUSH_CONFIG = {
  BASE_URL: 'https://api.covalenthq.com/v1',
  API_KEY: process.env.GOLDRUSH_API_KEY || process.env.NEXT_PUBLIC_GOLDRUSH_API_KEY || '',
  SUPPORTED_CHAINS: [1, 8453, 42161, 10, 137, 324] as const,
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * WalletConnect configuration
 */
export const WALLET_CONFIG = {
  PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '',
  METADATA: {
    name: 'Airdrop Finder',
    description: 'Check your wallet eligibility for airdrops',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    icons: ['/icon.svg'],
  },
} as const;

/**
 * API response headers
 */
export const API_HEADERS = {
  CACHE_CONTROL: 'Cache-Control',
  RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  REQUEST_ID: 'X-Request-Id',
} as const;

/**
 * API error codes
 */
export const API_ERROR_CODES = {
  // Client errors (4xx)
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  
  // Custom errors
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Content type constants
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  CSV: 'text/csv',
  TEXT: 'text/plain',
  ICAL: 'text/calendar',
} as const;

/**
 * Get API endpoint with parameters
 */
export function getApiEndpoint(
  endpoint: keyof typeof API_ENDPOINTS,
  params?: Record<string, string | number>
): string {
  let url = API_ENDPOINTS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`[${key}]`, String(value));
    });
  }
  
  return url;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get full API URL
 */
export function getFullApiUrl(
  endpoint: keyof typeof API_ENDPOINTS,
  params?: Record<string, string | number>,
  queryParams?: Record<string, any>
): string {
  const base = getApiEndpoint(endpoint, params);
  const query = queryParams ? buildQueryString(queryParams) : '';
  return `${base}${query}`;
}

