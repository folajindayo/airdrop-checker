/**
 * Database Configuration
 */

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
}

export const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL || '',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  connectionTimeout: 30000,
  idleTimeout: 60000,
};

export function validateDatabaseConfig(): void {
  if (!databaseConfig.url) {
    throw new Error('DATABASE_URL is required');
  }
}

