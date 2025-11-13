/**
 * Tests for storage utility
 */

import { Storage } from '@/lib/utils/storage';

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new Storage('test-prefix');
    // Clear storage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      storage.set('key', 'value');
      const retrieved = storage.get('key');

      expect(retrieved).toBe('value');
    });

    it('should store and retrieve objects', () => {
      const obj = { test: 'data', number: 123 };
      storage.set('obj', obj);
      const retrieved = storage.get('obj');

      expect(retrieved).toEqual(obj);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = storage.get('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove stored values', () => {
      storage.set('key', 'value');
      storage.remove('key');
      const retrieved = storage.get('key');

      expect(retrieved).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all prefixed keys', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.clear();

      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });
  });
});

