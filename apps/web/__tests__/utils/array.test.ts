/**
 * Tests for array utilities
 */

import {
  unique,
  uniqueBy,
  groupBy,
  chunk,
  shuffle,
  randomItem,
  randomItems,
  sortBy,
  difference,
  intersection,
  flatten,
  partition,
  sum,
  sumBy,
  average,
  averageBy,
  min,
  max,
  minMaxBy,
  areArraysEqual,
  moveItem,
  range,
} from '@/lib/utils/array';

describe('array utils', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates by key', () => {
      const arr = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ];
      
      expect(uniqueBy(arr, 'id')).toEqual([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]);
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const arr = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      
      const grouped = groupBy(arr, 'category');
      
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
    });

    it('should group by function', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const grouped = groupBy(arr, (n) => (n % 2 === 0 ? 'even' : 'odd'));
      
      expect(grouped.odd).toEqual([1, 3, 5]);
      expect(grouped.even).toEqual([2, 4, 6]);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled).toEqual(expect.arrayContaining(arr));
      expect(arr).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
  });

  describe('randomItem', () => {
    it('should return random item', () => {
      const arr = [1, 2, 3, 4, 5];
      const item = randomItem(arr);
      
      expect(arr).toContain(item);
    });

    it('should handle empty array', () => {
      expect(randomItem([])).toBeUndefined();
    });
  });

  describe('randomItems', () => {
    it('should return random items', () => {
      const arr = [1, 2, 3, 4, 5];
      const items = randomItems(arr, 3);
      
      expect(items).toHaveLength(3);
      items.forEach(item => expect(arr).toContain(item));
    });

    it('should not exceed array length', () => {
      const arr = [1, 2, 3];
      const items = randomItems(arr, 10);
      
      expect(items).toHaveLength(3);
    });
  });

  describe('sortBy', () => {
    it('should sort by key ascending', () => {
      const arr = [
        { age: 30 },
        { age: 20 },
        { age: 40 },
      ];
      
      const sorted = sortBy(arr, 'age');
      
      expect(sorted.map(x => x.age)).toEqual([20, 30, 40]);
    });

    it('should sort by key descending', () => {
      const arr = [
        { age: 30 },
        { age: 20 },
        { age: 40 },
      ];
      
      const sorted = sortBy(arr, 'age', 'desc');
      
      expect(sorted.map(x => x.age)).toEqual([40, 30, 20]);
    });

    it('should sort by function', () => {
      const arr = ['aaa', 'bb', 'c'];
      const sorted = sortBy(arr, (x) => x.length);
      
      expect(sorted).toEqual(['c', 'bb', 'aaa']);
    });
  });

  describe('difference', () => {
    it('should find difference', () => {
      expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
      expect(difference([1, 2, 3], [4, 5])).toEqual([1, 2, 3]);
    });
  });

  describe('intersection', () => {
    it('should find intersection', () => {
      expect(intersection([1, 2, 3, 4], [2, 3, 5])).toEqual([2, 3]);
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });
  });

  describe('flatten', () => {
    it('should flatten one level', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    it('should flatten multiple levels', () => {
      expect(flatten([[1, [2]], [3, [4]]], 2)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('partition', () => {
    it('should partition array', () => {
      const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
      
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });
  });

  describe('sum', () => {
    it('should sum numbers', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([])).toBe(0);
    });
  });

  describe('sumBy', () => {
    it('should sum by key', () => {
      const arr = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
      ];
      
      expect(sumBy(arr, 'value')).toBe(60);
    });
  });

  describe('average', () => {
    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20, 30])).toBe(20);
      expect(average([])).toBe(0);
    });
  });

  describe('averageBy', () => {
    it('should calculate average by key', () => {
      const arr = [
        { score: 80 },
        { score: 90 },
        { score: 70 },
      ];
      
      expect(averageBy(arr, 'score')).toBe(80);
    });
  });

  describe('min', () => {
    it('should find minimum', () => {
      expect(min([5, 2, 8, 1, 9])).toBe(1);
      expect(min([10])).toBe(10);
      expect(min([])).toBeUndefined();
    });
  });

  describe('max', () => {
    it('should find maximum', () => {
      expect(max([5, 2, 8, 1, 9])).toBe(9);
      expect(max([10])).toBe(10);
      expect(max([])).toBeUndefined();
    });
  });

  describe('minMaxBy', () => {
    it('should find min and max by key', () => {
      const arr = [
        { age: 30 },
        { age: 20 },
        { age: 40 },
      ];
      
      const { min, max } = minMaxBy(arr, 'age');
      
      expect(min?.age).toBe(20);
      expect(max?.age).toBe(40);
    });

    it('should handle empty array', () => {
      const { min, max } = minMaxBy([], 'value');
      
      expect(min).toBeUndefined();
      expect(max).toBeUndefined();
    });
  });

  describe('areArraysEqual', () => {
    it('should check equality', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });
  });

  describe('moveItem', () => {
    it('should move item in array', () => {
      expect(moveItem([1, 2, 3, 4, 5], 0, 2)).toEqual([2, 3, 1, 4, 5]);
      expect(moveItem([1, 2, 3, 4, 5], 4, 0)).toEqual([5, 1, 2, 3, 4]);
    });
  });

  describe('range', () => {
    it('should create range', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
    });
  });
});

