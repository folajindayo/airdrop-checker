/**
 * @fileoverview Database connection pool management with health checks
 * @module lib/database/connection-pool
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  /**
   * Maximum number of connections in the pool
   */
  maxConnections?: number;

  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout?: number;

  /**
   * Query timeout in milliseconds
   */
  queryTimeout?: number;

  /**
   * Maximum idle time for a connection in milliseconds
   */
  maxIdleTime?: number;

  /**
   * Enable connection logging
   */
  logConnections?: boolean;

  /**
   * Enable query logging
   */
  logQueries?: boolean;
}

/**
 * Connection pool statistics
 */
export interface PoolStatistics {
  /**
   * Total number of connections
   */
  totalConnections: number;

  /**
   * Number of active connections
   */
  activeConnections: number;

  /**
   * Number of idle connections
   */
  idleConnections: number;

  /**
   * Number of waiting requests
   */
  waitingRequests: number;

  /**
   * Average query time in milliseconds
   */
  averageQueryTime: number;

  /**
   * Total queries executed
   */
  totalQueries: number;
}

/**
 * Connection pool manager
 */
class ConnectionPool {
  private static instance: ConnectionPool;
  private prisma: PrismaClient | null = null;
  private config: ConnectionPoolConfig;
  private isInitialized = false;
  private queryTimes: number[] = [];
  private queryCount = 0;

  private constructor(config: ConnectionPoolConfig = {}) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      connectionTimeout: config.connectionTimeout || 10000,
      queryTimeout: config.queryTimeout || 30000,
      maxIdleTime: config.maxIdleTime || 60000,
      logConnections: config.logConnections || false,
      logQueries: config.logQueries || false,
    };
  }

  /**
   * Get or create singleton instance
   */
  public static getInstance(config?: ConnectionPoolConfig): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config);
    }
    return ConnectionPool.instance;
  }

  /**
   * Initialize the connection pool
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('Connection pool already initialized');
      return;
    }

    try {
      this.prisma = new PrismaClient({
        log: this.config.logQueries
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Test the connection
      await this.prisma.$connect();

      // Set up middleware for query tracking
      this.prisma.$use(async (params, next) => {
        const startTime = Date.now();
        const result = await next(params);
        const duration = Date.now() - startTime;

        this.queryCount++;
        this.queryTimes.push(duration);

        // Keep only last 100 query times for average calculation
        if (this.queryTimes.length > 100) {
          this.queryTimes.shift();
        }

        if (this.config.logQueries) {
          logger.debug('Database query executed', {
            model: params.model,
            action: params.action,
            duration: `${duration}ms`,
          });
        }

        return result;
      });

      this.isInitialized = true;

      if (this.config.logConnections) {
        logger.info('Database connection pool initialized', {
          maxConnections: this.config.maxConnections,
          connectionTimeout: this.config.connectionTimeout,
          queryTimeout: this.config.queryTimeout,
        });
      }
    } catch (error) {
      logger.error('Failed to initialize connection pool', { error });
      throw error;
    }
  }

  /**
   * Get the Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.prisma || !this.isInitialized) {
      throw new Error('Connection pool not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  /**
   * Get pool statistics
   */
  public async getStatistics(): Promise<PoolStatistics> {
    const averageQueryTime =
      this.queryTimes.length > 0
        ? this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length
        : 0;

    return {
      totalConnections: this.config.maxConnections || 0,
      activeConnections: 0, // Prisma doesn't expose this
      idleConnections: 0, // Prisma doesn't expose this
      waitingRequests: 0, // Prisma doesn't expose this
      averageQueryTime: Math.round(averageQueryTime),
      totalQueries: this.queryCount,
    };
  }

  /**
   * Health check for the connection pool
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!this.prisma || !this.isInitialized) {
      return {
        healthy: false,
        error: 'Connection pool not initialized',
      };
    }

    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;

      return {
        healthy: true,
        latency,
      };
    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a query with automatic retry
   */
  public async executeWithRetry<T>(
    operation: (client: PrismaClient) => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Connection pool not initialized');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation(this.prisma);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        logger.warn('Query attempt failed', {
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        });

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Close all connections in the pool
   */
  public async close(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isInitialized = false;

      if (this.config.logConnections) {
        logger.info('Database connection pool closed');
      }
    }
  }

  /**
   * Reset connection pool statistics
   */
  public resetStatistics(): void {
    this.queryTimes = [];
    this.queryCount = 0;
  }
}

/**
 * Get the connection pool instance
 */
export const getConnectionPool = (config?: ConnectionPoolConfig): ConnectionPool => {
  return ConnectionPool.getInstance(config);
};

/**
 * Get the Prisma client
 */
export const getPrismaClient = (): PrismaClient => {
  const pool = ConnectionPool.getInstance();
  return pool.getClient();
};

/**
 * Initialize the database connection pool
 */
export const initializeDatabase = async (
  config?: ConnectionPoolConfig
): Promise<void> => {
  const pool = getConnectionPool(config);
  await pool.initialize();
};

/**
 * Close the database connection pool
 */
export const closeDatabase = async (): Promise<void> => {
  const pool = getConnectionPool();
  await pool.close();
};

/**
 * Get database health status
 */
export const getDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> => {
  const pool = getConnectionPool();
  return await pool.healthCheck();
};

/**
 * Get database statistics
 */
export const getDatabaseStatistics = async (): Promise<PoolStatistics> => {
  const pool = getConnectionPool();
  return await pool.getStatistics();
};

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  const shutdown = async () => {
    logger.info('Shutting down database connections...');
    await closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

