import { MemoryCache, withCache, withCacheAsync } from "@/lib/cache/memory";

describe("MemoryCache", () => {
  let cache: MemoryCache<any>;

  beforeEach(() => {
    cache = new MemoryCache(1000); // 1 second TTL for testing
  });

  afterEach(() => {
    cache.clear();
  });

  describe("set and get", () => {
    it("stores and retrieves values", () => {
      cache.set("key", "value");
      expect(cache.get("key")).toBe("value");
    });

    it("returns null for non-existent keys", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("overwrites existing values", () => {
      cache.set("key", "value1");
      cache.set("key", "value2");
      expect(cache.get("key")).toBe("value2");
    });
  });

  describe("TTL expiration", () => {
    it("expires entries after TTL", async () => {
      cache.set("key", "value", 50);
      expect(cache.get("key")).toBe("value");

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.get("key")).toBeNull();
    });

    it("uses default TTL when not specified", async () => {
      const shortCache = new MemoryCache(50);
      shortCache.set("key", "value");
      expect(shortCache.get("key")).toBe("value");

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(shortCache.get("key")).toBeNull();
    });
  });

  describe("has", () => {
    it("returns true for existing keys", () => {
      cache.set("key", "value");
      expect(cache.has("key")).toBe(true);
    });

    it("returns false for non-existent keys", () => {
      expect(cache.has("nonexistent")).toBe(false);
    });

    it("returns false for expired keys", async () => {
      cache.set("key", "value", 50);
      expect(cache.has("key")).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(cache.has("key")).toBe(false);
    });
  });

  describe("delete", () => {
    it("removes entries", () => {
      cache.set("key", "value");
      cache.delete("key");
      expect(cache.get("key")).toBeNull();
    });

    it("returns true when entry existed", () => {
      cache.set("key", "value");
      expect(cache.delete("key")).toBe(true);
    });

    it("returns false when entry didn't exist", () => {
      expect(cache.delete("nonexistent")).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
    });
  });

  describe("size and keys", () => {
    it("returns correct size", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);
    });

    it("returns all keys", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      const keys = cache.keys();
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });
  });

  describe("getOrSet", () => {
    it("returns existing value", () => {
      cache.set("key", "cached");
      const value = cache.getOrSet("key", () => "fresh");
      expect(value).toBe("cached");
    });

    it("sets and returns new value", () => {
      const value = cache.getOrSet("key", () => "fresh");
      expect(value).toBe("fresh");
      expect(cache.get("key")).toBe("fresh");
    });

    it("only calls factory when cache miss", () => {
      const factory = jest.fn(() => "value");
      
      cache.getOrSet("key", factory);
      cache.getOrSet("key", factory);
      
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe("getOrSetAsync", () => {
    it("returns existing value", async () => {
      cache.set("key", "cached");
      const value = await cache.getOrSetAsync("key", async () => "fresh");
      expect(value).toBe("cached");
    });

    it("sets and returns new value", async () => {
      const value = await cache.getOrSetAsync("key", async () => "fresh");
      expect(value).toBe("fresh");
      expect(cache.get("key")).toBe("fresh");
    });
  });
});

describe("Utility functions", () => {
  describe("withCache", () => {
    it("caches function results", () => {
      const factory = jest.fn(() => "value");
      
      withCache("key", factory);
      withCache("key", factory);
      
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe("withCacheAsync", () => {
    it("caches async function results", async () => {
      const factory = jest.fn(async () => "value");
      
      await withCacheAsync("key", factory);
      await withCacheAsync("key", factory);
      
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
});

