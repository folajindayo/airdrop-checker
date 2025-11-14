/**
 * Environment Configuration
 * 
 * Centralized environment variable access with type safety and validation.
 */

import { z } from 'zod';

/**
 * Environment Variable Schema
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Airdrop Checker'),
  
  // API
  NEXT_PUBLIC_API_URL: z.string().optional(),
  API_TIMEOUT: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 30000)),
  
  // Database
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
  
  // GoldRush API (blockchain data)
  GOLDRUSH_API_KEY: z.string().optional(),
  GOLDRUSH_API_URL: z.string().url().optional(),
  
  // WalletConnect
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  
  // Sentry
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 60)),
  RATE_LIMIT_WINDOW: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 60000)),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional().transform((val) => val === 'true'),
  NEXT_PUBLIC_ENABLE_WEB3: z.string().optional().transform((val) => val !== 'false'),
  
  // Email
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // AWS
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Vercel
  VERCEL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
  
  // Security
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  JWT_SECRET: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  
  // Monitoring
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

/**
 * Parsed and validated environment variables
 */
let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Invalid environment variables');
}

/**
 * Type-safe environment variables
 */
export const env = parsedEnv;

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Check if running on Vercel
 */
export const isVercel = !!env.VERCEL;

/**
 * Get app URL
 */
export const getAppUrl = (): string => {
  // Vercel URL
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  
  // Configured URL
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }
  
  // Default
  return 'http://localhost:3000';
};

/**
 * Get API URL
 */
export const getApiUrl = (): string => {
  if (env.NEXT_PUBLIC_API_URL) {
    return env.NEXT_PUBLIC_API_URL;
  }
  
  return `${getAppUrl()}/api`;
};

/**
 * Get database URL
 */
export const getDatabaseUrl = (): string | undefined => {
  return env.DATABASE_URL;
};

/**
 * Get Redis URL
 */
export const getRedisUrl = (): string | undefined => {
  return env.REDIS_URL || env.UPSTASH_REDIS_REST_URL;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: string): boolean => {
  const featureMap: Record<string, boolean | undefined> = {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    web3: env.NEXT_PUBLIC_ENABLE_WEB3,
  };
  
  return featureMap[feature] ?? false;
};

/**
 * Get GoldRush API configuration
 */
export const getGoldRushConfig = () => ({
  apiKey: env.GOLDRUSH_API_KEY,
  apiUrl: env.GOLDRUSH_API_URL || 'https://api.covalenthq.com',
});

/**
 * Get rate limit configuration
 */
export const getRateLimitConfig = () => ({
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  windowMs: env.RATE_LIMIT_WINDOW,
});

/**
 * Get email configuration
 */
export const getEmailConfig = () => ({
  server: env.EMAIL_SERVER,
  from: env.EMAIL_FROM,
});

/**
 * Get AWS configuration
 */
export const getAWSConfig = () => ({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  s3Bucket: env.AWS_S3_BUCKET,
});

/**
 * Get logging configuration
 */
export const getLoggingConfig = () => ({
  level: env.LOG_LEVEL,
  pretty: isDevelopment,
});

/**
 * Validate required environment variables for specific features
 */
export const validateFeatureEnv = (feature: string): boolean => {
  switch (feature) {
    case 'database':
      return !!env.DATABASE_URL;
    
    case 'redis':
      return !!(env.REDIS_URL || env.UPSTASH_REDIS_REST_URL);
    
    case 'goldrush':
      return !!env.GOLDRUSH_API_KEY;
    
    case 'walletconnect':
      return !!env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
    
    case 'email':
      return !!(env.EMAIL_SERVER && env.EMAIL_FROM);
    
    case 'aws':
      return !!(
        env.AWS_ACCESS_KEY_ID &&
        env.AWS_SECRET_ACCESS_KEY &&
        env.AWS_REGION
      );
    
    case 'auth':
      return !!(env.NEXTAUTH_SECRET && env.NEXTAUTH_URL);
    
    default:
      return false;
  }
};

/**
 * Get all missing required environment variables
 */
export const getMissingEnvVars = (): string[] => {
  const missing: string[] = [];
  
  if (isProduction) {
    if (!env.DATABASE_URL) missing.push('DATABASE_URL');
    if (!env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET');
    if (!env.GOLDRUSH_API_KEY) missing.push('GOLDRUSH_API_KEY');
  }
  
  return missing;
};

/**
 * Log environment information (safe for logging)
 */
export const logEnvInfo = (): void => {
  console.log('🌍 Environment Information:');
  console.log(`  NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  App URL: ${getAppUrl()}`);
  console.log(`  API URL: ${getApiUrl()}`);
  console.log(`  Database: ${env.DATABASE_URL ? '✓ Connected' : '✗ Not configured'}`);
  console.log(`  Redis: ${getRedisUrl() ? '✓ Connected' : '✗ Not configured'}`);
  console.log(`  GoldRush API: ${env.GOLDRUSH_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`  Log Level: ${env.LOG_LEVEL}`);
  
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
};

// Export type for TypeScript
export type Env = typeof env;
