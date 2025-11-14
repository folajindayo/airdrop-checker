/**
 * Tests for Object Utility Functions
 */

import {
  deepClone,
  deepMerge,
  pick,
  omit,
  isEmpty,
  get,
  set,
  isEqual,
  mapValues,
  mapKeys,
  filterObject,
  invert,
  flatten,
  unflatten,
  groupBy,
  keyBy,
  countBy,
  compact,
  defaults,
  has,
  values,
  entries,
  deepFreeze,
} from '@/lib/utils/object';

describe('Object Utilities', () => {
  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(null)).toBe(null);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });

    it('should clone dates', () => {
      const date = new Date('2023-01-01');
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      
      expect(deepMerge(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
      const obj1 = { a: { b: 1, c: 2 } };
      const obj2 = { a: { c: 3, d: 4 } };
      
      expect(deepMerge(obj1, obj2)).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });

    it('should handle arrays', () => {
      const obj1 = { arr: [1, 2] };
      const obj2 = { arr: [3, 4] };
      
      expect(deepMerge(obj1, obj2)).toEqual({ arr: [3, 4] });
    });
  });

  describe('pick', () => {
    it('should pick specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should ignore non-existent keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ['a', 'c' as any])).toEqual({ a: 1 });
    });
  });

  describe('omit', () => {
    it('should omit specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe('get', () => {
    it('should get nested property', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(get(obj, 'a.b.c')).toBe(42);
      expect(get(obj, ['a', 'b', 'c'])).toBe(42);
    });

    it('should return default value if not found', () => {
      const obj = { a: 1 };
      expect(get(obj, 'b.c', 'default')).toBe('default');
    });

    it('should handle null/undefined', () => {
      expect(get(null, 'a.b', 'default')).toBe('default');
      expect(get({ a: null }, 'a.b', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('should set nested property', () => {
      const obj: any = {};
      set(obj, 'a.b.c', 42);
      expect(obj.a.b.c).toBe(42);
    });

    it('should handle array path', () => {
      const obj: any = {};
      set(obj, ['a', 'b'], 42);
      expect(obj.a.b).toBe(42);
    });
  });

  describe('isEqual', () => {
    it('should compare primitives', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('a', 'a')).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
    });

    it('should compare objects deeply', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should compare arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2], [1, 3])).toBe(false);
    });
  });

  describe('mapValues', () => {
    it('should map object values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = mapValues(obj, (v) => v * 2);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });
  });

  describe('mapKeys', () => {
    it('should map object keys', () => {
      const obj = { a: 1, b: 2 };
      const result = mapKeys(obj, (k) => k.toUpperCase());
      expect(result).toEqual({ A: 1, B: 2 });
    });
  });

  describe('filterObject', () => {
    it('should filter object by predicate', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = filterObject(obj, (v) => v > 1);
      expect(result).toEqual({ b: 2, c: 3 });
    });
  });

  describe('invert', () => {
    it('should invert object keys and values', () => {
      const obj = { a: '1', b: '2' };
      expect(invert(obj)).toEqual({ '1': 'a', '2': 'b' });
    });
  });

  describe('flatten', () => {
    it('should flatten nested object', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 };
      expect(flatten(obj)).toEqual({ 'a.b.c': 1, d: 2 });
    });

    it('should use custom separator', () => {
      const obj = { a: { b: 1 } };
      expect(flatten(obj, '', '_')).toEqual({ a_b: 1 });
    });
  });

  describe('unflatten', () => {
    it('should unflatten object', () => {
      const obj = { 'a.b.c': 1, d: 2 };
      expect(unflatten(obj)).toEqual({ a: { b: { c: 1 } }, d: 2 });
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const arr = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      
      const result = groupBy(arr, 'type');
      expect(result.a).toHaveLength(2);
      expect(result.b).toHaveLength(1);
    });

    it('should group by function', () => {
      const arr = [{ age: 15 }, { age: 25 }, { age: 35 }];
      const result = groupBy(arr, (item) => (item.age < 20 ? 'young' : 'adult'));
      
      expect(result.young).toHaveLength(1);
      expect(result.adult).toHaveLength(2);
    });
  });

  describe('keyBy', () => {
    it('should create object keyed by property', () => {
      const arr = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
      ];
      
      const result = keyBy(arr, 'id');
      expect(result).toEqual({
        a: { id: 'a', value: 1 },
        b: { id: 'b', value: 2 },
      });
    });
  });

  describe('countBy', () => {
    it('should count values', () => {
      const arr = [
        { type: 'a' },
        { type: 'b' },
        { type: 'a' },
        { type: 'a' },
      ];
      
      const result = countBy(arr, 'type');
      expect(result).toEqual({ a: 3, b: 1 });
    });
  });

  describe('compact', () => {
    it('should remove null and undefined', () => {
      const obj = { a: 1, b: null, c: undefined, d: 0 };
      expect(compact(obj)).toEqual({ a: 1, d: 0 });
    });
  });

  describe('defaults', () => {
    it('should apply default values', () => {
      const obj = { a: 1 };
      const defaultValues = { a: 0, b: 2, c: 3 };
      
      expect(defaults(obj, defaultValues)).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe('has', () => {
    it('should check if property exists', () => {
      const obj = { a: 1, b: undefined };
      
      expect(has(obj, 'a')).toBe(true);
      expect(has(obj, 'b')).toBe(true);
      expect(has(obj, 'c')).toBe(false);
    });
  });

  describe('values', () => {
    it('should get all values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(values(obj)).toEqual([1, 2, 3]);
    });
  });

  describe('entries', () => {
    it('should get all entries', () => {
      const obj = { a: 1, b: 2 };
      const result = entries(obj);
      
      expect(result).toContainEqual(['a', 1]);
      expect(result).toContainEqual(['b', 2]);
    });
  });

  describe('deepFreeze', () => {
    it('should freeze object deeply', () => {
      const obj: any = { a: { b: 1 } };
      const frozen = deepFreeze(obj);
      
      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.a)).toBe(true);
      
      expect(() => {
        frozen.a.b = 2;
      }).toThrow();
    });
  });
});
