import {
  shallowEqual,
  memoizeOne,
} from "@/lib/performance/memo";

describe("Performance Memo Utilities", () => {
  describe("shallowEqual", () => {
    it("returns true for identical objects", () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });

    it("returns true for equal shallow objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it("returns false for objects with different values", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it("returns false for objects with different keys", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 2 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it("returns true for primitives", () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual("test", "test")).toBe(true);
      expect(shallowEqual(true, true)).toBe(true);
    });

    it("returns false for different primitives", () => {
      expect(shallowEqual(1, 2)).toBe(false);
      expect(shallowEqual("test", "test2")).toBe(false);
    });

    it("returns true for null/undefined", () => {
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(undefined, undefined)).toBe(true);
    });

    it("returns false for nested objects with same reference", () => {
      const nested = { c: 3 };
      const obj1 = { a: 1, b: nested };
      const obj2 = { a: 1, b: nested };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it("returns false for nested objects with different reference", () => {
      const obj1 = { a: 1, b: { c: 3 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });
  });

  describe("memoizeOne", () => {
    it("returns cached result for same arguments", () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoizeOne(fn);

      const result1 = memoized(1, 2);
      const result2 = memoized(1, 2);

      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("recomputes for different arguments", () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoizeOne(fn);

      const result1 = memoized(1, 2);
      const result2 = memoized(2, 3);

      expect(result1).toBe(3);
      expect(result2).toBe(5);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("only caches last result", () => {
      const fn = jest.fn((a: number) => a * 2);
      const memoized = memoizeOne(fn);

      memoized(1);
      memoized(2);
      memoized(1);

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("works with zero arguments", () => {
      const fn = jest.fn(() => 42);
      const memoized = memoizeOne(fn);

      const result1 = memoized();
      const result2 = memoized();

      expect(result1).toBe(42);
      expect(result2).toBe(42);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("works with object arguments", () => {
      const fn = jest.fn((obj: { a: number }) => obj.a * 2);
      const memoized = memoizeOne(fn);

      const obj = { a: 5 };
      const result1 = memoized(obj);
      const result2 = memoized(obj);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

