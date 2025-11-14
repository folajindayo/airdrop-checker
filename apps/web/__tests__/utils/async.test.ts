/**
 * Tests for async utilities
 */

import {
  sleep,
  retry,
  timeout,
  debounce,
  throttle,
  batchProcess,
  sequential,
  poll,
  safeAwait,
} from '@/lib/utils/async';

describe('async utils', () => {
  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = jest.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      });

      const result = await retry(fn, { maxAttempts: 3, delay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Always fails');
      });

      await expect(
        retry(fn, { maxAttempts: 3, delay: 10 })
      ).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      let attempts = 0;
      const onRetry = jest.fn();
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Failed');
        return 'success';
      };

      await retry(fn, { maxAttempts: 3, delay: 10, onRetry });
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeout', () => {
    it('should resolve if promise completes in time', async () => {
      const promise = Promise.resolve('success');
      const result = await timeout(promise, 1000);
      expect(result).toBe('success');
    });

    it('should reject if promise takes too long', async () => {
      const promise = sleep(200).then(() => 'too slow');
      await expect(timeout(promise, 50)).rejects.toThrow('Operation timed out');
    });

    it('should use custom error message', async () => {
      const promise = sleep(200);
      await expect(
        timeout(promise, 50, 'Custom timeout')
      ).rejects.toThrow('Custom timeout');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      await sleep(150);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call with latest arguments', async () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 50);

      debounced('first');
      debounced('second');
      debounced('third');

      await sleep(100);
      expect(fn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      await sleep(150);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchProcess', () => {
    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5];
      const fn = jest.fn(async (x: number) => x * 2);

      const results = await batchProcess(items, fn, 2);

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should handle empty array', async () => {
      const results = await batchProcess([], async (x) => x, 2);
      expect(results).toEqual([]);
    });
  });

  describe('sequential', () => {
    it('should process items sequentially', async () => {
      const order: number[] = [];
      const items = [1, 2, 3];
      const fn = async (x: number) => {
        await sleep(10);
        order.push(x);
        return x * 2;
      };

      const results = await sequential(items, fn);

      expect(results).toEqual([2, 4, 6]);
      expect(order).toEqual([1, 2, 3]);
    });

    it('should pass index to function', async () => {
      const items = ['a', 'b', 'c'];
      const fn = jest.fn(async (item, index) => `${item}${index}`);

      await sequential(items, fn);

      expect(fn).toHaveBeenNthCalledWith(1, 'a', 0);
      expect(fn).toHaveBeenNthCalledWith(2, 'b', 1);
      expect(fn).toHaveBeenNthCalledWith(3, 'c', 2);
    });
  });

  describe('poll', () => {
    it('should poll until condition is met', async () => {
      let count = 0;
      const fn = async () => {
        count++;
        return count;
      };

      const result = await poll(fn, {
        condition: (val) => val >= 3,
        interval: 10,
        maxAttempts: 10,
      });

      expect(result).toBe(3);
      expect(count).toBe(3);
    });

    it('should throw if max attempts exceeded', async () => {
      const fn = async () => false;

      await expect(
        poll(fn, {
          condition: (val) => val === true,
          interval: 10,
          maxAttempts: 3,
        })
      ).rejects.toThrow('Polling exceeded maximum attempts');
    });

    it('should call onPoll callback', async () => {
      const onPoll = jest.fn();
      let count = 0;
      const fn = async () => ++count;

      await poll(fn, {
        condition: (val) => val >= 2,
        interval: 10,
        maxAttempts: 5,
        onPoll,
      });

      expect(onPoll).toHaveBeenCalledTimes(2);
    });
  });

  describe('safeAwait', () => {
    it('should return [null, result] on success', async () => {
      const promise = Promise.resolve('success');
      const [error, result] = await safeAwait(promise);

      expect(error).toBeNull();
      expect(result).toBe('success');
    });

    it('should return [error, null] on failure', async () => {
      const promise = Promise.reject(new Error('Failed'));
      const [error, result] = await safeAwait(promise);

      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Failed');
      expect(result).toBeNull();
    });
  });
});

