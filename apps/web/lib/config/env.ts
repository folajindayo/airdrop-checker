/**
 * Environment Configuration
 * 
 * Type-safe environment variable management
 */

export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  goldrushApiKey: string;
  databaseUrl: string;
  redisUrl?: string;
  nextPublicUrl: string;
}

/**
 * Get environment configuration
 */
export function getEnvConfig(): EnvironmentConfig {
  return {
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    goldrushApiKey: process.env.GOLDRUSH_API_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL,
    nextPublicUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  };
}

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const config = getEnvConfig();
  const required: (keyof EnvironmentConfig)[] = [
    'goldrushApiKey',
    'databaseUrl',
  ];

  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Check if in production
 */
export function isProduction(): boolean {
  return getEnvConfig().nodeEnv === 'production';
}

/**
 * Check if in development
 */
export function isDevelopment(): boolean {
  return getEnvConfig().nodeEnv === 'development';
}

/**
 * Check if in test
 */
export function isTest(): boolean {
  return getEnvConfig().nodeEnv === 'test';
}
