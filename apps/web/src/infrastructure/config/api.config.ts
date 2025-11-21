/**
 * API Configuration
 */

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  endpoints: {
    airdrops: '/airdrops',
    eligibility: '/eligibility/check',
    portfolio: '/portfolio',
    search: '/search',
  },
  headers: {
    'Content-Type': 'application/json',
  },
};

export const externalApiConfig = {
  goldrush: {
    baseUrl: 'https://api.covalenthq.com/v1',
    apiKey: process.env.GOLDRUSH_API_KEY || '',
    timeout: 15000,
  },
  alchemy: {
    baseUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    apiKey: process.env.ALCHEMY_API_KEY || '',
  },
};
