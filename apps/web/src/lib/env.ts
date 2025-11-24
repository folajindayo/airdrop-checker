/**
 * Environment Variables
 */

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  GOLDRUSH_API_KEY: process.env.GOLDRUSH_API_KEY || '',
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

