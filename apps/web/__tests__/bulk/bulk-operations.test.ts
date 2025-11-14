/**
 * @fileoverview Tests for bulk operations
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  BulkOperationsProcessor,
  BulkOperationType,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
} from '@/lib/bulk/bulk-operations';

describe('BulkOperationsProcessor', () => {
  const sampleItems = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  describe('Bulk Processing', () => {
    it('should process all items successfully', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler
      );

      expect(result.success).toBe(true);
      expect(result.successfulItems).toHaveLength(50);
      expect(result.failedItems).toHaveLength(0);
      expect(result.successRate).toBe(100);
    });

    it('should handle partial failures with continueOnError', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        if (item.id % 10 === 0) {
          throw new Error('Processing error');
        }
        return Promise.resolve(item);
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler,
        { continueOnError: true }
      );

      expect(result.successfulItems).toHaveLength(45);
      expect(result.failedItems).toHaveLength(5);
      expect(result.successRate).toBe(90);
    });

    it('should stop on first error when continueOnError is false', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        if (item.id === 5) {
          throw new Error('Processing error');
        }
        return Promise.resolve(item);
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler,
        { continueOnError: false, batchSize: 10 }
      );

      expect(result.success).toBe(false);
      expect(handler).toHaveBeenCalledTimes(5);
    });
  });

  describe('Batching', () => {
    it('should process items in batches', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler,
        { batchSize: 10 }
      );

      expect(handler).toHaveBeenCalledTimes(50);
    });

    it('should respect custom batch size', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      const batchSize = 25;

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler,
        { batchSize }
      );

      expect(handler).toHaveBeenCalledTimes(50);
    });

    it('should handle batch delay', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      const startTime = Date.now();

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 20),
        handler,
        { batchSize: 10, batchDelay: 100 }
      );

      const elapsed = Date.now() - startTime;
      // Should have at least one delay between batches
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Parallel Processing', () => {
    it('should process items in parallel', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(item), 10);
        });
      });

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 10),
        handler,
        { parallel: true, maxConcurrency: 5 }
      );

      expect(handler).toHaveBeenCalledTimes(10);
    });

    it('should respect max concurrency', async () => {
      let concurrent = 0;
      let maxConcurrent = 0;

      const handler = jest.fn().mockImplementation((item: any) => {
        return new Promise((resolve) => {
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);

          setTimeout(() => {
            concurrent--;
            resolve(item);
          }, 50);
        });
      });

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 20),
        handler,
        { parallel: true, maxConcurrency: 3 }
      );

      expect(maxConcurrent).toBeLessThanOrEqual(3);
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      const onProgress = jest.fn();

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 10),
        handler,
        { onProgress, batchSize: 5 }
      );

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          processed: expect.any(Number),
          total: 10,
          percentage: expect.any(Number),
        })
      );
    });

    it('should report accurate progress', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      const progressCalls: any[] = [];

      await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 20),
        handler,
        {
          onProgress: (progress) => progressCalls.push(progress),
          batchSize: 10,
        }
      );

      const finalProgress = progressCalls[progressCalls.length - 1];
      expect(finalProgress.processed).toBe(20);
      expect(finalProgress.percentage).toBe(100);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed items when enabled', async () => {
      let attempt = 0;
      const handler = jest.fn().mockImplementation((item: any) => {
        attempt++;
        if (attempt <= 2 && item.id === 1) {
          throw new Error('Temporary error');
        }
        return Promise.resolve(item);
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        [{ id: 1, name: 'Test' }],
        handler,
        { retryFailed: true, maxRetries: 3 }
      );

      expect(result.successfulItems).toHaveLength(1);
      expect(result.failedItems).toHaveLength(0);
    });

    it('should give up after max retries', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Persistent error'));

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        [{ id: 1, name: 'Test' }],
        handler,
        { retryFailed: true, maxRetries: 2 }
      );

      expect(result.successfulItems).toHaveLength(0);
      expect(result.failedItems).toHaveLength(1);
      expect(handler).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Operation Types', () => {
    it('should support bulk create', async () => {
      const handler = jest.fn().mockResolvedValue({ created: true });

      const result = await bulkCreate(sampleItems.slice(0, 5), handler);

      expect(result.successfulItems).toHaveLength(5);
    });

    it('should support bulk update', async () => {
      const handler = jest.fn().mockResolvedValue({ updated: true });

      const result = await bulkUpdate(sampleItems.slice(0, 5), handler);

      expect(result.successfulItems).toHaveLength(5);
    });

    it('should support bulk delete', async () => {
      const handler = jest.fn().mockResolvedValue({ deleted: true });

      const result = await bulkDelete(sampleItems.slice(0, 5), handler);

      expect(result.successfulItems).toHaveLength(5);
    });
  });

  describe('Error Details', () => {
    it('should capture error messages for failed items', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        if (item.id === 5) {
          throw new Error('Custom error message');
        }
        return Promise.resolve(item);
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 10),
        handler,
        { continueOnError: true }
      );

      const failedItem = result.failedItems.find((f) => f.item.id === 5);
      expect(failedItem?.error).toBe('Custom error message');
    });
  });

  describe('Performance Metrics', () => {
    it('should track processing time', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(item), 10);
        });
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 5),
        handler
      );

      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should calculate success rate', async () => {
      const handler = jest.fn().mockImplementation((item: any) => {
        if (item.id > 7) {
          throw new Error('Error');
        }
        return Promise.resolve(item);
      });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems.slice(0, 10),
        handler,
        { continueOnError: true }
      );

      expect(result.successRate).toBe(70);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty array', async () => {
      const handler = jest.fn();

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        [],
        handler
      );

      expect(result.totalProcessed).toBe(0);
      expect(result.successRate).toBe(0);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle single item', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        [{ id: 1, name: 'Single' }],
        handler
      );

      expect(result.successfulItems).toHaveLength(1);
      expect(result.successRate).toBe(100);
    });

    it('should handle large batch size', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });

      const result = await BulkOperationsProcessor.process(
        BulkOperationType.CREATE,
        sampleItems,
        handler,
        { batchSize: 1000 }
      );

      expect(result.successfulItems).toHaveLength(50);
    });
  });
});

