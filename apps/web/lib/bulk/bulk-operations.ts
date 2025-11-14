/**
 * @fileoverview Bulk operations handler for processing large datasets
 * @module lib/bulk/bulk-operations
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * Bulk operation types
 */
export enum BulkOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPSERT = 'upsert',
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = any> {
  /**
   * Operation success status
   */
  success: boolean;

  /**
   * Successfully processed items
   */
  successfulItems: T[];

  /**
   * Failed items with errors
   */
  failedItems: Array<{
    item: T;
    error: string;
  }>;

  /**
   * Total items processed
   */
  totalProcessed: number;

  /**
   * Processing time in milliseconds
   */
  processingTime: number;

  /**
   * Success rate percentage
   */
  successRate: number;
}

/**
 * Bulk operation options
 */
export interface BulkOperationOptions {
  /**
   * Batch size for processing
   */
  batchSize?: number;

  /**
   * Continue on error (default: true)
   */
  continueOnError?: boolean;

  /**
   * Parallel batch processing
   */
  parallel?: boolean;

  /**
   * Maximum concurrent batches
   */
  maxConcurrency?: number;

  /**
   * Progress callback
   */
  onProgress?: (progress: {
    processed: number;
    total: number;
    percentage: number;
  }) => void;

  /**
   * Retry failed items
   */
  retryFailed?: boolean;

  /**
   * Max retry attempts
   */
  maxRetries?: number;

  /**
   * Delay between batches (ms)
   */
  batchDelay?: number;
}

/**
 * Bulk operations processor
 */
export class BulkOperationsProcessor {
  /**
   * Process bulk operation
   */
  public static async process<T, R = T>(
    operation: BulkOperationType,
    items: T[],
    handler: (item: T) => Promise<R>,
    options: BulkOperationOptions = {}
  ): Promise<BulkOperationResult<R>> {
    const startTime = Date.now();

    const opts = {
      batchSize: options.batchSize || 100,
      continueOnError: options.continueOnError ?? true,
      parallel: options.parallel ?? false,
      maxConcurrency: options.maxConcurrency || 5,
      retryFailed: options.retryFailed ?? false,
      maxRetries: options.maxRetries || 3,
      batchDelay: options.batchDelay || 0,
      ...options,
    };

    const successfulItems: R[] = [];
    const failedItems: Array<{ item: T; error: string }> = [];

    try {
      const batches = this.createBatches(items, opts.batchSize);

      logger.info('Starting bulk operation', {
        operation,
        totalItems: items.length,
        batches: batches.length,
        batchSize: opts.batchSize,
        parallel: opts.parallel,
      });

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        if (opts.parallel) {
          // Process batch items in parallel
          const results = await this.processParallelBatch(
            batch,
            handler,
            opts.maxConcurrency,
            opts.continueOnError
          );

          successfulItems.push(...results.successful);
          failedItems.push(...results.failed);
        } else {
          // Process batch items sequentially
          for (const item of batch) {
            try {
              const result = await handler(item);
              successfulItems.push(result);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              logger.warn('Bulk operation item failed', {
                operation,
                error: errorMessage,
              });

              failedItems.push({
                item,
                error: errorMessage,
              });

              if (!opts.continueOnError) {
                throw error;
              }
            }
          }
        }

        // Report progress
        const processed = successfulItems.length + failedItems.length;
        const percentage = Math.round((processed / items.length) * 100);

        if (opts.onProgress) {
          opts.onProgress({
            processed,
            total: items.length,
            percentage,
          });
        }

        logger.debug('Batch processed', {
          batch: i + 1,
          totalBatches: batches.length,
          processed,
          percentage: `${percentage}%`,
        });

        // Delay between batches if configured
        if (i < batches.length - 1 && opts.batchDelay > 0) {
          await this.delay(opts.batchDelay);
        }
      }

      // Retry failed items if configured
      if (opts.retryFailed && failedItems.length > 0) {
        logger.info('Retrying failed items', { count: failedItems.length });

        const retryResults = await this.retryFailedItems(
          failedItems.map((f) => f.item),
          handler,
          opts.maxRetries
        );

        successfulItems.push(...retryResults.successful);
        
        // Update failed items with final failures
        failedItems.length = 0;
        failedItems.push(...retryResults.failed);
      }

      const processingTime = Date.now() - startTime;
      const successRate =
        items.length > 0 ? (successfulItems.length / items.length) * 100 : 0;

      logger.info('Bulk operation completed', {
        operation,
        totalItems: items.length,
        successful: successfulItems.length,
        failed: failedItems.length,
        successRate: `${successRate.toFixed(2)}%`,
        processingTime: `${processingTime}ms`,
      });

      return {
        success: failedItems.length === 0,
        successfulItems,
        failedItems,
        totalProcessed: items.length,
        processingTime,
        successRate,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Bulk operation failed', {
        operation,
        error,
        processed: successfulItems.length + failedItems.length,
        total: items.length,
      });

      return {
        success: false,
        successfulItems,
        failedItems,
        totalProcessed: successfulItems.length + failedItems.length,
        processingTime,
        successRate: items.length > 0 ? (successfulItems.length / items.length) * 100 : 0,
      };
    }
  }

  /**
   * Create batches from items array
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Process batch in parallel with concurrency limit
   */
  private static async processParallelBatch<T, R>(
    items: T[],
    handler: (item: T) => Promise<R>,
    maxConcurrency: number,
    continueOnError: boolean
  ): Promise<{
    successful: R[];
    failed: Array<{ item: T; error: string }>;
  }> {
    const successful: R[] = [];
    const failed: Array<{ item: T; error: string }> = [];
    const queue = [...items];
    const running: Promise<void>[] = [];

    const processItem = async (item: T): Promise<void> => {
      try {
        const result = await handler(item);
        successful.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        failed.push({ item, error: errorMessage });

        if (!continueOnError) {
          throw error;
        }
      }
    };

    while (queue.length > 0 || running.length > 0) {
      while (running.length < maxConcurrency && queue.length > 0) {
        const item = queue.shift();
        if (item) {
          const promise = processItem(item).then(() => {
            const index = running.indexOf(promise);
            if (index !== -1) {
              running.splice(index, 1);
            }
          });

          running.push(promise);
        }
      }

      if (running.length > 0) {
        await Promise.race(running);
      }
    }

    return { successful, failed };
  }

  /**
   * Retry failed items
   */
  private static async retryFailedItems<T, R>(
    items: T[],
    handler: (item: T) => Promise<R>,
    maxRetries: number
  ): Promise<{
    successful: R[];
    failed: Array<{ item: T; error: string }>;
  }> {
    const successful: R[] = [];
    const failed: Array<{ item: T; error: string }> = [];

    for (const item of items) {
      let lastError: string = 'Unknown error';
      let retried = false;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await handler(item);
          successful.push(result);
          retried = true;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';

          if (attempt < maxRetries - 1) {
            // Exponential backoff
            await this.delay(Math.pow(2, attempt) * 1000);
          }
        }
      }

      if (!retried) {
        failed.push({ item, error: lastError });
      }
    }

    return { successful, failed };
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Bulk create operation
   */
  public static async bulkCreate<T, R = T>(
    items: T[],
    createHandler: (item: T) => Promise<R>,
    options?: BulkOperationOptions
  ): Promise<BulkOperationResult<R>> {
    return this.process(BulkOperationType.CREATE, items, createHandler, options);
  }

  /**
   * Bulk update operation
   */
  public static async bulkUpdate<T, R = T>(
    items: T[],
    updateHandler: (item: T) => Promise<R>,
    options?: BulkOperationOptions
  ): Promise<BulkOperationResult<R>> {
    return this.process(BulkOperationType.UPDATE, items, updateHandler, options);
  }

  /**
   * Bulk delete operation
   */
  public static async bulkDelete<T, R = T>(
    items: T[],
    deleteHandler: (item: T) => Promise<R>,
    options?: BulkOperationOptions
  ): Promise<BulkOperationResult<R>> {
    return this.process(BulkOperationType.DELETE, items, deleteHandler, options);
  }

  /**
   * Bulk upsert operation
   */
  public static async bulkUpsert<T, R = T>(
    items: T[],
    upsertHandler: (item: T) => Promise<R>,
    options?: BulkOperationOptions
  ): Promise<BulkOperationResult<R>> {
    return this.process(BulkOperationType.UPSERT, items, upsertHandler, options);
  }
}

/**
 * Quick access functions
 */

export const bulkCreate = BulkOperationsProcessor.bulkCreate.bind(BulkOperationsProcessor);
export const bulkUpdate = BulkOperationsProcessor.bulkUpdate.bind(BulkOperationsProcessor);
export const bulkDelete = BulkOperationsProcessor.bulkDelete.bind(BulkOperationsProcessor);
export const bulkUpsert = BulkOperationsProcessor.bulkUpsert.bind(BulkOperationsProcessor);

