/**
 * @fileoverview Comprehensive tests for useLocalStorage hook
 * Tests reading, writing, and syncing with localStorage
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('default');
    });

    it('should return stored value when localStorage has data', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('stored');
    });

    it('should handle different data types', () => {
      // String
      localStorage.setItem('string-key', JSON.stringify('hello'));
      const { result: stringResult } = renderHook(() =>
        useLocalStorage('string-key', '')
      );
      expect(stringResult.current[0]).toBe('hello');

      // Number
      localStorage.setItem('number-key', JSON.stringify(42));
      const { result: numberResult } = renderHook(() =>
        useLocalStorage('number-key', 0)
      );
      expect(numberResult.current[0]).toBe(42);

      // Boolean
      localStorage.setItem('boolean-key', JSON.stringify(true));
      const { result: boolResult } = renderHook(() =>
        useLocalStorage('boolean-key', false)
      );
      expect(boolResult.current[0]).toBe(true);

      // Object
      localStorage.setItem('object-key', JSON.stringify({ key: 'value' }));
      const { result: objResult } = renderHook(() =>
        useLocalStorage('object-key', {})
      );
      expect(objResult.current[0]).toEqual({ key: 'value' });

      // Array
      localStorage.setItem('array-key', JSON.stringify([1, 2, 3]));
      const { result: arrResult } = renderHook(() =>
        useLocalStorage('array-key', [])
      );
      expect(arrResult.current[0]).toEqual([1, 2, 3]);
    });

    it('should use initial value if stored data is invalid JSON', () => {
      localStorage.setItem('test-key', 'invalid-json{');

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('default');
    });

    it('should use initial value if localStorage throws error', () => {
      const spy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('default');

      spy.mockRestore();
    });
  });

  describe('Setting Values', () => {
    it('should update localStorage when setting value', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('test-key')).toBe(
        JSON.stringify('updated')
      );
    });

    it('should handle function updates', () => {
      const { result } = renderHook(() =>
        useLocalStorage('counter', 0)
      );

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(2);
    });

    it('should store complex objects', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: '', age: 0 })
      );

      const user = { name: 'John', age: 30 };
      act(() => {
        result.current[1](user);
      });

      expect(result.current[0]).toEqual(user);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    });

    it('should store arrays', () => {
      const { result } = renderHook(() =>
        useLocalStorage<number[]>('numbers', [])
      );

      act(() => {
        result.current[1]([1, 2, 3]);
      });

      expect(result.current[0]).toEqual([1, 2, 3]);

      act(() => {
        result.current[1]((prev) => [...prev, 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });

    it('should handle rapid updates', () => {
      const { result } = renderHook(() =>
        useLocalStorage('counter', 0)
      );

      act(() => {
        result.current[1](1);
        result.current[1](2);
        result.current[1](3);
      });

      expect(result.current[0]).toBe(3);
      expect(localStorage.getItem('counter')).toBe(JSON.stringify(3));
    });

    it('should handle localStorage.setItem errors', () => {
      const spy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage full');
        });

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      );

      act(() => {
        result.current[1]('updated');
      });

      // State should still update even if localStorage fails
      expect(result.current[0]).toBe('updated');

      spy.mockRestore();
    });
  });

  describe('Removing Values', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('default');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should handle remove when key does not exist', () => {
      const { result } = renderHook(() =>
        useLocalStorage('nonexistent', 'default')
      );

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('default');
    });

    it('should handle localStorage.removeItem errors', () => {
      const spy = jest
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Remove error');
        });

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('default');

      spy.mockRestore();
    });
  });

  describe('Storage Events', () => {
    it('should sync state when storage event occurs', () => {
      const { result } = renderHook(() =>
        useLocalStorage('sync-key', 'initial')
      );

      // Simulate storage event from another tab
      act(() => {
        localStorage.setItem('sync-key', JSON.stringify('from-another-tab'));
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'sync-key',
            newValue: JSON.stringify('from-another-tab'),
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('from-another-tab');
    });

    it('should not sync when event is for different key', () => {
      const { result } = renderHook(() =>
        useLocalStorage('my-key', 'initial')
      );

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'other-key',
            newValue: JSON.stringify('other-value'),
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('initial');
    });

    it('should reset to initial value when storage item is removed', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBe('stored');

      // Simulate storage event for removal
      act(() => {
        localStorage.removeItem('test-key');
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'test-key',
            newValue: null,
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('default');
    });

    it('should cleanup storage event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(
        window,
        'removeEventListener'
      );

      const { unmount } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Multiple Instances', () => {
    it('should sync between multiple instances of same key', () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage('shared', 'initial')
      );

      const { result: result2 } = renderHook(() =>
        useLocalStorage('shared', 'initial')
      );

      act(() => {
        result1.current[1]('updated');
      });

      // Both should have the updated value after storage event
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'shared',
            newValue: JSON.stringify('updated'),
            storageArea: localStorage,
          })
        );
      });

      expect(result1.current[0]).toBe('updated');
      expect(result2.current[0]).toBe('updated');
    });

    it('should not interfere with different keys', () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage('key1', 'value1')
      );

      const { result: result2 } = renderHook(() =>
        useLocalStorage('key2', 'value2')
      );

      act(() => {
        result1.current[1]('updated1');
      });

      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null initial value', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>('test-key', null)
      );

      expect(result.current[0]).toBeNull();
    });

    it('should handle undefined as stored value', () => {
      localStorage.setItem('test-key', JSON.stringify(undefined));

      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'default')
      );

      expect(result.current[0]).toBeUndefined();
    });

    it('should handle empty string as key', () => {
      const { result } = renderHook(() =>
        useLocalStorage('', 'default')
      );

      act(() => {
        result.current[1]('value');
      });

      expect(localStorage.getItem('')).toBe(JSON.stringify('value'));
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);

      const { result } = renderHook(() =>
        useLocalStorage(longKey, 'default')
      );

      act(() => {
        result.current[1]('value');
      });

      expect(localStorage.getItem(longKey)).toBe(JSON.stringify('value'));
    });

    it('should handle very large values', () => {
      const largeValue = 'x'.repeat(10000);

      const { result } = renderHook(() =>
        useLocalStorage('large-key', '')
      );

      act(() => {
        result.current[1](largeValue);
      });

      expect(result.current[0]).toBe(largeValue);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should work for theme preference', () => {
      const { result } = renderHook(() =>
        useLocalStorage<'light' | 'dark'>('theme', 'light')
      );

      expect(result.current[0]).toBe('light');

      act(() => {
        result.current[1]('dark');
      });

      expect(result.current[0]).toBe('dark');
      expect(localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
    });

    it('should work for shopping cart', () => {
      interface CartItem {
        id: string;
        quantity: number;
      }

      const { result } = renderHook(() =>
        useLocalStorage<CartItem[]>('cart', [])
      );

      act(() => {
        result.current[1]((prev) => [
          ...prev,
          { id: 'item1', quantity: 1 },
        ]);
      });

      expect(result.current[0]).toEqual([{ id: 'item1', quantity: 1 }]);

      act(() => {
        result.current[1]((prev) =>
          prev.map((item) =>
            item.id === 'item1'
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      });

      expect(result.current[0]).toEqual([{ id: 'item1', quantity: 2 }]);
    });

    it('should work for user preferences', () => {
      interface UserPreferences {
        notifications: boolean;
        language: string;
        fontSize: number;
      }

      const { result } = renderHook(() =>
        useLocalStorage<UserPreferences>('preferences', {
          notifications: true,
          language: 'en',
          fontSize: 16,
        })
      );

      act(() => {
        result.current[1]((prev) => ({
          ...prev,
          fontSize: 18,
        }));
      });

      expect(result.current[0].fontSize).toBe(18);
      expect(result.current[0].notifications).toBe(true);
    });
  });
});

