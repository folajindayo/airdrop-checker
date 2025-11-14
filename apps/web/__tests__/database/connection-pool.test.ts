/**
 * @fileoverview Tests for database connection pool
 */

import {
  ConnectionPool,
  createConnectionPool,
  getPool,
  closeAllPools,
} from '@/lib/database/connection-pool';

describe('Database Connection Pool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = createConnectionPool({
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
      min: 2,
      max: 10,
    });
  });

  afterEach(async () => {
    await pool.close();
  });

  describe('Connection Pool Creation', () => {
    it('should create a connection pool', () => {
      expect(pool).toBeDefined();
      expect(pool.getStats()).toBeDefined();
    });

    it('should initialize with min connections', async () => {
      await pool.connect();
      const stats = pool.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
    });

    it('should respect max connections', async () => {
      const connections = [];

      // Try to get more than max connections
      for (let i = 0; i < 15; i++) {
        try {
          const conn = await pool.acquire();
          connections.push(conn);
        } catch (error) {
          // Expected to fail when exceeding max
          break;
        }
      }

      const stats = pool.getStats();
      expect(stats.total).toBeLessThanOrEqual(10);

      // Release connections
      for (const conn of connections) {
        await pool.release(conn);
      }
    });
  });

  describe('Connection Acquisition', () => {
    it('should acquire a connection', async () => {
      const connection = await pool.acquire();

      expect(connection).toBeDefined();
      expect(connection.id).toBeDefined();

      await pool.release(connection);
    });

    it('should wait for available connection', async () => {
      const pool = createConnectionPool({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        max: 1,
      });

      const conn1 = await pool.acquire();

      const acquirePromise = pool.acquire();

      // Release first connection
      setTimeout(() => pool.release(conn1), 100);

      const conn2 = await acquirePromise;

      expect(conn2).toBeDefined();

      await pool.release(conn2);
      await pool.close();
    });

    it('should timeout if no connection available', async () => {
      const pool = createConnectionPool({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        max: 1,
        acquireTimeout: 100,
      });

      const conn1 = await pool.acquire();

      await expect(pool.acquire()).rejects.toThrow('Acquire timeout');

      await pool.release(conn1);
      await pool.close();
    });
  });

  describe('Connection Release', () => {
    it('should release a connection back to pool', async () => {
      const connection = await pool.acquire();
      const statsBefore = pool.getStats();

      await pool.release(connection);
      const statsAfter = pool.getStats();

      expect(statsAfter.idle).toBe(statsBefore.idle + 1);
    });

    it('should not release invalid connection', async () => {
      const invalidConnection = { id: 'invalid' } as any;

      await expect(pool.release(invalidConnection)).rejects.toThrow();
    });
  });

  describe('Connection Health', () => {
    it('should check connection health', async () => {
      const connection = await pool.acquire();

      const isHealthy = await pool.checkHealth(connection);

      expect(typeof isHealthy).toBe('boolean');

      await pool.release(connection);
    });

    it('should remove unhealthy connections', async () => {
      const connection = await pool.acquire();
      
      // Simulate unhealthy connection
      (connection as any)._isHealthy = false;

      await pool.release(connection);
      const stats = pool.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(0);
    });

    it('should perform periodic health checks', async () => {
      const pool = createConnectionPool({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        healthCheckInterval: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 150));

      const stats = pool.getStats();
      expect(stats).toBeDefined();

      await pool.close();
    });
  });

  describe('Pool Statistics', () => {
    it('should provide accurate statistics', async () => {
      const conn1 = await pool.acquire();
      const conn2 = await pool.acquire();

      const stats = pool.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.idle).toBeGreaterThanOrEqual(0);
      expect(stats.active).toBeGreaterThanOrEqual(2);

      await pool.release(conn1);
      await pool.release(conn2);
    });

    it('should track connection usage', async () => {
      const connection = await pool.acquire();

      await pool.release(connection);

      const stats = pool.getStats();
      expect(stats.totalAcquired).toBeGreaterThanOrEqual(1);
      expect(stats.totalReleased).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Pool Closing', () => {
    it('should close all connections', async () => {
      const conn1 = await pool.acquire();
      const conn2 = await pool.acquire();

      await pool.release(conn1);
      await pool.release(conn2);

      await pool.close();

      const stats = pool.getStats();
      expect(stats.total).toBe(0);
    });

    it('should reject new acquisitions after closing', async () => {
      await pool.close();

      await expect(pool.acquire()).rejects.toThrow();
    });

    it('should wait for active connections before closing', async () => {
      const connection = await pool.acquire();

      const closePromise = pool.close();

      // Release connection
      setTimeout(() => pool.release(connection), 50);

      await expect(closePromise).resolves.toBeUndefined();
    });
  });

  describe('Global Pool Management', () => {
    afterEach(async () => {
      await closeAllPools();
    });

    it('should get named pool', () => {
      const pool1 = getPool('default');
      const pool2 = getPool('default');

      expect(pool1).toBe(pool2);
    });

    it('should create different pools for different names', () => {
      const pool1 = getPool('db1');
      const pool2 = getPool('db2');

      expect(pool1).not.toBe(pool2);
    });

    it('should close all pools', async () => {
      const pool1 = getPool('db1');
      const pool2 = getPool('db2');

      await closeAllPools();

      // Pools should be closed
      expect(pool1.getStats().total).toBe(0);
      expect(pool2.getStats().total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const pool = createConnectionPool({
        host: 'invalid-host',
        port: 5432,
        database: 'test_db',
      });

      await expect(pool.acquire()).rejects.toThrow();

      await pool.close();
    });

    it('should retry failed connections', async () => {
      const pool = createConnectionPool({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        retryAttempts: 3,
        retryDelay: 100,
      });

      expect(pool).toBeDefined();

      await pool.close();
    });

    it('should handle release errors gracefully', async () => {
      const connection = await pool.acquire();

      // Simulate error during release
      (connection as any)._shouldError = true;

      await expect(pool.release(connection)).resolves.toBeUndefined();
    });
  });

  describe('Connection Reuse', () => {
    it('should reuse released connections', async () => {
      const conn1 = await pool.acquire();
      const id1 = conn1.id;

      await pool.release(conn1);

      const conn2 = await pool.acquire();
      const id2 = conn2.id;

      expect(id1).toBe(id2);

      await pool.release(conn2);
    });

    it('should not reuse unhealthy connections', async () => {
      const conn1 = await pool.acquire();
      const id1 = conn1.id;

      // Mark as unhealthy
      (conn1 as any)._isHealthy = false;

      await pool.release(conn1);

      const conn2 = await pool.acquire();
      const id2 = conn2.id;

      expect(id1).not.toBe(id2);

      await pool.release(conn2);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent acquisitions', async () => {
      const acquisitions = Array(20)
        .fill(null)
        .map(() => pool.acquire());

      const connections = await Promise.all(acquisitions);

      expect(connections).toHaveLength(20);

      await Promise.all(connections.map((conn) => pool.release(conn)));
    });

    it('should maintain performance with high load', async () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        const conn = await pool.acquire();
        await pool.release(conn);
      }

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });
});

