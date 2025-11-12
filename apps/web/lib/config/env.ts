/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present and valid
 */

/**
 * Environment variable schema
 */
interface EnvSchema {
  // Required variables
  GOLDRUSH_API_KEY: string;
  NEXT_PUBLIC_REOWN_PROJECT_ID: string;
  DATABASE_URL: string;
  
  // Optional variables
  NODE_ENV?: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_GOLDRUSH_API_KEY?: string;
  ENABLE_ANALYTICS?: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Validated environment variables
 */
export interface ValidatedEnv {
  goldrushApiKey: string;
  reownProjectId: string;
  databaseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  appUrl: string;
  enableAnalytics: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Parse boolean environment variable
 */
function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Validate environment variables
 */
export function validateEnv(): ValidatedEnv {
  // Get required variables
  const goldrushApiKey =
    getOptionalEnvVar('GOLDRUSH_API_KEY') ||
    getOptionalEnvVar('NEXT_PUBLIC_GOLDRUSH_API_KEY');
  
  if (!goldrushApiKey) {
    console.warn('Warning: GOLDRUSH_API_KEY is not set. GoldRush API calls will fail.');
  }
  
  const reownProjectId = getOptionalEnvVar('NEXT_PUBLIC_REOWN_PROJECT_ID');
  if (!reownProjectId) {
    console.warn('Warning: NEXT_PUBLIC_REOWN_PROJECT_ID is not set. WalletConnect will not work.');
  }
  
  const databaseUrl = getOptionalEnvVar('DATABASE_URL');
  if (!databaseUrl) {
    console.warn('Warning: DATABASE_URL is not set. Database operations will fail.');
  }
  
  // Get optional variables
  const nodeEnv = (getOptionalEnvVar('NODE_ENV', 'development') as any) || 'development';
  const appUrl = getOptionalEnvVar(
    'NEXT_PUBLIC_APP_URL',
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  const enableAnalytics = parseBooleanEnv(getOptionalEnvVar('ENABLE_ANALYTICS'));
  const logLevel = (getOptionalEnvVar('LOG_LEVEL', 'info') as any) || 'info';
  
  // Validate node environment
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validNodeEnvs.join(', ')}`);
  }
  
  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(logLevel)) {
    throw new Error(`Invalid LOG_LEVEL: ${logLevel}. Must be one of: ${validLogLevels.join(', ')}`);
  }
  
  return {
    goldrushApiKey,
    reownProjectId,
    databaseUrl,
    nodeEnv,
    appUrl,
    enableAnalytics,
    logLevel,
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
  };
}

/**
 * Validated environment configuration (singleton)
 */
let cachedEnv: ValidatedEnv | null = null;

/**
 * Get validated environment configuration
 */
export function getEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().isProduction;
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().isDevelopment;
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().isTest;
}

/**
 * Get API key for GoldRush
 */
export function getGoldrushApiKey(): string {
  return getEnv().goldrushApiKey;
}

/**
 * Get Reown project ID
 */
export function getReownProjectId(): string {
  return getEnv().reownProjectId;
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string {
  return getEnv().databaseUrl;
}

/**
 * Get app URL
 */
export function getAppUrl(): string {
  return getEnv().appUrl;
}

/**
 * Check if analytics are enabled
 */
export function isAnalyticsEnabled(): boolean {
  return getEnv().enableAnalytics;
}

/**
 * Get log level
 */
export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  return getEnv().logLevel;
}

/**
 * Validate required environment variables at startup
 */
export function validateRequiredEnv(): void {
  try {
    validateEnv();
    console.log('✓ Environment variables validated successfully');
  } catch (error) {
    console.error('✗ Environment variable validation failed:', error);
    if (isProduction()) {
      throw error;
    }
  }
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo(): Record<string, any> {
  const env = getEnv();
  
  return {
    nodeEnv: env.nodeEnv,
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
    isTest: env.isTest,
    hasGoldrushKey: !!env.goldrushApiKey,
    hasReownProjectId: !!env.reownProjectId,
    hasDatabaseUrl: !!env.databaseUrl,
    enableAnalytics: env.enableAnalytics,
    logLevel: env.logLevel,
    appUrl: env.appUrl,
  };
}

