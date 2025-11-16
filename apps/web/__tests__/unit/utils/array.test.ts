/**
 * Array Utilities Tests
 */

import { chunk, unique, groupBy, shuffle } from '../../../src/core/utils/array';

describe('Array Utils', () => {
  describe('chunk', () => {
    it('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = chunk(arr, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      expect(unique(arr)).toEqual([1, 2, 3]);
    });

    it('should preserve order', () => {
      const arr = [3, 1, 2, 1, 3];
      expect(unique(arr)).toEqual([3, 1, 2]);
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const arr = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      const result = groupBy(arr, 'type');
      expect(result.a).toHaveLength(2);
      expect(result.b).toHaveLength(1);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...arr]);
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr);
    });
  });
});

