/**
 * Tests for Array Utility Functions
 */

import {
  chunk,
  compact,
  unique,
  uniqueBy,
  groupBy,
  sortBy,
  shuffle,
  sample,
  flatten,
  intersection,
  difference,
  union,
  partition,
  pluck,
  sum,
  average,
  min,
  max,
  range,
  zip,
  unzip,
} from '@/lib/utils/array';

describe('Array Utilities', () => {
  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });
  });

  describe('compact', () => {
    it('should remove falsy values', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined])).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(compact([])).toEqual([]);
    });

    it('should keep all truthy values', () => {
      expect(compact([1, 'a', true, {}])).toEqual([1, 'a', true, {}]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should handle strings', () => {
      expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates by key', () => {
      const arr = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice2' },
      ];
      expect(uniqueBy(arr, 'id')).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('should work with function', () => {
      const arr = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice2' },
      ];
      expect(uniqueBy(arr, (item) => item.id)).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const arr = [
        { category: 'fruit', name: 'apple' },
        { category: 'vegetable', name: 'carrot' },
        { category: 'fruit', name: 'banana' },
      ];
      expect(groupBy(arr, 'category')).toEqual({
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' },
        ],
        vegetable: [{ category: 'vegetable', name: 'carrot' }],
      });
    });

    it('should work with function', () => {
      const arr = [{ age: 10 }, { age: 20 }, { age: 15 }];
      const grouped = groupBy(arr, (item) => (item.age < 18 ? 'minor' : 'adult'));
      expect(grouped.minor).toHaveLength(2);
      expect(grouped.adult).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('should sort by key', () => {
      const arr = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      expect(sortBy(arr, 'age')).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 30 },
        { name: 'Bob', age: 35 },
      ]);
    });

    it('should work with function', () => {
      const arr = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      expect(sortBy(arr, (item) => item.name)).toEqual([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled).toEqual(expect.arrayContaining(arr));
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3];
      const shuffled = shuffle(arr);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('sample', () => {
    it('should return random element', () => {
      const arr = [1, 2, 3, 4, 5];
      const sampled = sample(arr);
      expect(arr).toContain(sampled);
    });

    it('should return undefined for empty array', () => {
      expect(sample([])).toBeUndefined();
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      expect(flatten([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      expect(flatten([[], [1], []])).toEqual([1]);
    });

    it('should handle already flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('intersection', () => {
    it('should find common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    });

    it('should handle no intersection', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(intersection([], [1, 2])).toEqual([]);
    });
  });

  describe('difference', () => {
    it('should find different elements', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    });

    it('should handle no difference', () => {
      expect(difference([1, 2], [1, 2])).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(difference([], [1, 2])).toEqual([]);
    });
  });

  describe('union', () => {
    it('should combine arrays without duplicates', () => {
      expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle empty arrays', () => {
      expect(union([], [1, 2])).toEqual([1, 2]);
    });

    it('should handle identical arrays', () => {
      expect(union([1, 2], [1, 2])).toEqual([1, 2]);
    });
  });

  describe('partition', () => {
    it('should partition by predicate', () => {
      const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });

    it('should handle empty array', () => {
      const [trues, falses] = partition([], () => true);
      expect(trues).toEqual([]);
      expect(falses).toEqual([]);
    });
  });

  describe('pluck', () => {
    it('should extract values by key', () => {
      const arr = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
      ];
      expect(pluck(arr, 'name')).toEqual(['Alice', 'Bob']);
    });

    it('should handle empty array', () => {
      expect(pluck([], 'key')).toEqual([]);
    });
  });

  describe('sum', () => {
    it('should calculate sum', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });

    it('should handle empty array', () => {
      expect(sum([])).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(sum([-1, -2, 3])).toBe(0);
    });
  });

  describe('average', () => {
    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should handle empty array', () => {
      expect(average([])).toBe(0);
    });

    it('should handle decimals', () => {
      expect(average([1, 2, 3])).toBeCloseTo(2);
    });
  });

  describe('min', () => {
    it('should find minimum', () => {
      expect(min([3, 1, 4, 1, 5])).toBe(1);
    });

    it('should handle negative numbers', () => {
      expect(min([3, -1, 4])).toBe(-1);
    });

    it('should return undefined for empty array', () => {
      expect(min([])).toBeUndefined();
    });
  });

  describe('max', () => {
    it('should find maximum', () => {
      expect(max([3, 1, 4, 1, 5])).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(max([-3, -1, -4])).toBe(-1);
    });

    it('should return undefined for empty array', () => {
      expect(max([])).toBeUndefined();
    });
  });

  describe('range', () => {
    it('should create range from 0', () => {
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    });

    it('should create range with start and end', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4]);
    });

    it('should create range with step', () => {
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    });

    it('should handle negative step', () => {
      expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
    });
  });

  describe('zip', () => {
    it('should zip arrays', () => {
      expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
    });

    it('should handle different lengths', () => {
      expect(zip([1, 2], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [2, 'b'],
      ]);
    });

    it('should handle empty arrays', () => {
      expect(zip([], [])).toEqual([]);
    });
  });

  describe('unzip', () => {
    it('should unzip arrays', () => {
      const [numbers, letters] = unzip([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]);
      expect(numbers).toEqual([1, 2, 3]);
      expect(letters).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      expect(unzip([])).toEqual([]);
    });
  });
});

