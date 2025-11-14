/**
 * Tests for object utilities
 */

import {
  pick,
  omit,
  deepClone,
  deepMerge,
  isEmpty,
  get,
  set,
  has,
  mapValues,
  mapKeys,
  filterObject,
  invert,
  flattenObject,
  unflattenObject,
  isEqual,
  entries,
  toQueryString,
  fromQueryString,
} from '@/lib/utils/object';

describe('object utils', () => {
  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should ignore non-existent keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ['a', 'c' as any])).toEqual({ a: 1 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('deepClone', () => {
    it('should clone simple objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);
      
      cloned.a.b.c = 2;
      expect(obj.a.b.c).toBe(1);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);
      
      (cloned[2] as number[])[0] = 5;
      expect((arr[2] as number[])[0]).toBe(3);
    });

    it('should clone dates', () => {
      const date = new Date('2024-01-01');
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      
      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      
      expect(deepMerge(target, source)).toEqual({
        a: { b: 1, c: 3, d: 4 },
      });
    });
  });

  describe('isEmpty', () => {
    it('should check if object is empty', () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('get', () => {
    it('should get nested property', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(get(obj, 'a.b.c')).toBe(42);
    });

    it('should return default value if not found', () => {
      const obj = { a: { b: 1 } };
      expect(get(obj, 'a.c.d', 'default')).toBe('default');
    });

    it('should handle null/undefined', () => {
      expect(get(null, 'a.b')).toBeUndefined();
      expect(get({ a: null }, 'a.b', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('should set nested property', () => {
      const obj = {};
      set(obj, 'a.b.c', 42);
      
      expect(obj).toEqual({ a: { b: { c: 42 } } });
    });

    it('should override existing property', () => {
      const obj = { a: { b: 1 } };
      set(obj, 'a.b', 2);
      
      expect(obj.a.b).toBe(2);
    });
  });

  describe('has', () => {
    it('should check if property exists', () => {
      const obj = { a: { b: { c: 1 } } };
      
      expect(has(obj, 'a.b.c')).toBe(true);
      expect(has(obj, 'a.b.d')).toBe(false);
    });
  });

  describe('mapValues', () => {
    it('should map object values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const mapped = mapValues(obj, (val) => val * 2);
      
      expect(mapped).toEqual({ a: 2, b: 4, c: 6 });
    });
  });

  describe('mapKeys', () => {
    it('should map object keys', () => {
      const obj = { a: 1, b: 2 };
      const mapped = mapKeys(obj, (key) => `${String(key)}_new`);
      
      expect(mapped).toEqual({ a_new: 1, b_new: 2 });
    });
  });

  describe('filterObject', () => {
    it('should filter object by predicate', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const filtered = filterObject(obj, (val) => val > 1);
      
      expect(filtered).toEqual({ b: 2, c: 3 });
    });
  });

  describe('invert', () => {
    it('should invert object keys and values', () => {
      const obj = { a: '1', b: '2' };
      expect(invert(obj)).toEqual({ '1': 'a', '2': 'b' });
    });
  });

  describe('flattenObject', () => {
    it('should flatten nested object', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      expect(flattenObject(obj)).toEqual({ 'a.b.c': 1, d: 2 });
    });
  });

  describe('unflattenObject', () => {
    it('should unflatten object', () => {
      const obj = { 'a.b.c': 1, d: 2 };
      expect(unflattenObject(obj)).toEqual({ a: { b: { c: 1 } }, d: 2 });
    });
  });

  describe('isEqual', () => {
    it('should check deep equality', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });

    it('should handle primitives', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('a', 'a')).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
    });
  });

  describe('entries', () => {
    it('should return typed entries', () => {
      const obj = { a: 1, b: 2 };
      const result = entries(obj);
      
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });
  });

  describe('toQueryString', () => {
    it('should convert object to query string', () => {
      const obj = { a: 1, b: 'test', c: true };
      expect(toQueryString(obj)).toBe('a=1&b=test&c=true');
    });

    it('should skip null and undefined', () => {
      const obj = { a: 1, b: null, c: undefined };
      expect(toQueryString(obj)).toBe('a=1');
    });

    it('should encode special characters', () => {
      const obj = { q: 'hello world' };
      expect(toQueryString(obj)).toBe('q=hello%20world');
    });
  });

  describe('fromQueryString', () => {
    it('should parse query string', () => {
      expect(fromQueryString('a=1&b=test')).toEqual({ a: '1', b: 'test' });
    });

    it('should handle query string with ?', () => {
      expect(fromQueryString('?a=1&b=2')).toEqual({ a: '1', b: '2' });
    });

    it('should decode special characters', () => {
      expect(fromQueryString('q=hello%20world')).toEqual({ q: 'hello world' });
    });

    it('should handle empty string', () => {
      expect(fromQueryString('')).toEqual({});
    });
  });
});

