import {
  dbMonitor,
  measureQuery,
  batchQuery,
  createQueryCache,
} from "@/lib/performance/database";

describe("Database Performance Utilities", () => {
  beforeEach(() => {
    dbMonitor.clear();
  });

  describe("measureQuery", () => {
    it("measures query execution time", async () => {
      const executor = jest.fn(async () => [1, 2, 3]);

      await measureQuery("SELECT * FROM users", executor);

      const queries = dbMonitor.getQueries();
      expect(queries).toHaveLength(1);
      expect(queries[0].query).toBe("SELECT * FROM users");
      expect(queries[0].duration).toBeGreaterThanOrEqual(0);
    });

    it("logs row count for array results", async () => {
      const result = [1, 2, 3];
      const executor = jest.fn(async () => result);

      await measureQuery("SELECT * FROM users", executor);

      const queries = dbMonitor.getQueries();
      expect(queries[0].rows).toBe(3);
    });

    it("measures even when query fails", async () => {
      const executor = jest.fn(async () => {
        throw new Error("Query failed");
      });

      await expect(measureQuery("BAD QUERY", executor)).rejects.toThrow("Query failed");

      const queries = dbMonitor.getQueries();
      expect(queries).toHaveLength(1);
    });
  });

  describe("dbMonitor", () => {
    it("tracks slow queries", () => {
      dbMonitor.setSlowQueryThreshold(100);
      dbMonitor.logQuery("FAST QUERY", 50);
      dbMonitor.logQuery("SLOW QUERY", 200);

      const slowQueries = dbMonitor.getSlowQueries();
      expect(slowQueries).toHaveLength(1);
      expect(slowQueries[0].query).toBe("SLOW QUERY");
    });

    it("calculates average query time", () => {
      dbMonitor.logQuery("QUERY 1", 100);
      dbMonitor.logQuery("QUERY 2", 200);
      dbMonitor.logQuery("QUERY 3", 300);

      expect(dbMonitor.getAverageQueryTime()).toBe(200);
    });

    it("returns 0 for average when no queries", () => {
      expect(dbMonitor.getAverageQueryTime()).toBe(0);
    });
  });

  describe("batchQuery", () => {
    it("processes items in batches", async () => {
      const items = Array.from({ length: 250 }, (_, i) => i);
      const executor = jest.fn(async (batch) => batch.length);

      await batchQuery(items, executor, { batchSize: 100 });

      expect(executor).toHaveBeenCalledTimes(3);
      expect(executor).toHaveBeenNthCalledWith(1, expect.arrayContaining([0, 1, 2]));
    });

    it("uses default batch size", async () => {
      const items = Array.from({ length: 250 }, (_, i) => i);
      const executor = jest.fn(async (batch) => batch.length);

      await batchQuery(items, executor);

      expect(executor).toHaveBeenCalledTimes(3);
    });

    it("adds delay between batches", async () => {
      const items = [1, 2, 3];
      const executor = jest.fn(async (batch) => batch);

      const start = Date.now();
      await batchQuery(items, executor, { batchSize: 1, delay: 50 });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe("createQueryCache", () => {
    it("caches values", () => {
      const cache = createQueryCache<string, number>();

      cache.set("key", 42);
      expect(cache.get("key")).toBe(42);
    });

    it("returns null for missing keys", () => {
      const cache = createQueryCache();

      expect(cache.get("nonexistent")).toBeNull();
    });

    it("expires values after TTL", async () => {
      const cache = createQueryCache<string, number>(50);

      cache.set("key", 42);
      expect(cache.get("key")).toBe(42);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get("key")).toBeNull();
    });

    it("deletes individual keys", () => {
      const cache = createQueryCache();

      cache.set("key1", 1);
      cache.set("key2", 2);
      cache.delete("key1");

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBe(2);
    });

    it("clears all cache", () => {
      const cache = createQueryCache();

      cache.set("key1", 1);
      cache.set("key2", 2);
      cache.clear();

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
    });
  });
});

