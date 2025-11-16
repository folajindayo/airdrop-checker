/**
 * API v1 Route Index
 * Central export point for all v1 API utilities and types
 */

// Middleware
export * from './_middleware';

// Error handling
export * from './_errors';

// Validators
export * from './_validators';

// Formatters
export * from './_formatters';

// Configuration
export * from './_config/rate-limits';

// Types
export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  auth?: boolean;
  rateLimit?: number;
}

export const API_ENDPOINTS: Record<string, APIEndpoint> = {
  HEALTH: {
    path: '/api/v1/health',
    method: 'GET',
    description: 'Health check endpoint',
    auth: false,
  },
  AIRDROPS_LIST: {
    path: '/api/v1/airdrops',
    method: 'GET',
    description: 'List all airdrops',
    auth: false,
    rateLimit: 100,
  },
  AIRDROPS_CHECK: {
    path: '/api/v1/airdrops/check',
    method: 'POST',
    description: 'Check airdrop eligibility',
    auth: false,
    rateLimit: 50,
  },
  PORTFOLIO_GET: {
    path: '/api/v1/portfolio/:address',
    method: 'GET',
    description: 'Get portfolio for address',
    auth: false,
    rateLimit: 100,
  },
  PORTFOLIO_COMPARE: {
    path: '/api/v1/portfolio/compare',
    method: 'POST',
    description: 'Compare multiple portfolios',
    auth: false,
    rateLimit: 30,
  },
  TRANSACTIONS_LIST: {
    path: '/api/v1/transactions',
    method: 'GET',
    description: 'List transactions',
    auth: false,
    rateLimit: 100,
  },
  TRANSACTIONS_ANALYZE: {
    path: '/api/v1/transactions/analyze',
    method: 'POST',
    description: 'Analyze transaction patterns',
    auth: false,
    rateLimit: 20,
  },
  ONCHAIN_FEATURES: {
    path: '/api/v1/onchain',
    method: 'GET',
    description: 'Get onchain features',
    auth: false,
  },
  DOCS: {
    path: '/api/v1/docs',
    method: 'GET',
    description: 'API documentation',
    auth: false,
  },
};

