/**
 * Queue Service
 * Asynchronous task queue with concurrency control
 */

export interface QueueTask<T = any> {
  id: string;
  execute: () => Promise<T>;
  priority?: number;
}

export interface QueueConfig {
  concurrency?: number;
  timeout?: number;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface TaskResult<T = any> {
  id: string;
  status: TaskStatus;
  result?: T;
  error?: Error;
  startTime?: number;
  endTime?: number;
}

export class QueueService {
  private queue: QueueTask[] = [];
  private running: Set<string> = new Set();
  private results: Map<string, TaskResult> = new Map();
  private readonly concurrency: number;
  private readonly timeout: number;

  constructor(config: QueueConfig = {}) {
    this.concurrency = config.concurrency || 5;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Add task to queue
   */
  async add<T>(task: QueueTask<T>): Promise<TaskResult<T>> {
    this.queue.push(task);
    this.results.set(task.id, {
      id: task.id,
      status: TaskStatus.PENDING,
    });

    this.processQueue();

    return new Promise((resolve) => {
      const checkResult = () => {
        const result = this.results.get(task.id);
        
        if (
          result &&
          (result.status === TaskStatus.COMPLETED || result.status === TaskStatus.FAILED)
        ) {
          resolve(result as TaskResult<T>);
        } else {
          setTimeout(checkResult, 100);
        }
      };

      checkResult();
    });
  }

  /**
   * Process queue
   */
  private async processQueue(): Promise<void> {
    if (this.running.size >= this.concurrency) {
      return;
    }

    // Sort by priority
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const task = this.queue.shift();
    if (!task) return;

    this.running.add(task.id);
    
    const result = this.results.get(task.id)!;
    result.status = TaskStatus.RUNNING;
    result.startTime = Date.now();

    try {
      const taskResult = await this.executeWithTimeout(task);
      
      result.status = TaskStatus.COMPLETED;
      result.result = taskResult;
      result.endTime = Date.now();
    } catch (error) {
      result.status = TaskStatus.FAILED;
      result.error = error as Error;
      result.endTime = Date.now();
    } finally {
      this.running.delete(task.id);
      this.processQueue();
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout<T>(task: QueueTask<T>): Promise<T> {
    return Promise.race([
      task.execute(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), this.timeout)
      ),
    ]);
  }

  /**
   * Get task result
   */
  getResult<T = any>(id: string): TaskResult<T> | undefined {
    return this.results.get(id) as TaskResult<T>;
  }

  /**
   * Get all results
   */
  getAllResults(): TaskResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      pending: this.queue.length,
      running: this.running.size,
      completed: Array.from(this.results.values()).filter(
        (r) => r.status === TaskStatus.COMPLETED
      ).length,
      failed: Array.from(this.results.values()).filter(
        (r) => r.status === TaskStatus.FAILED
      ).length,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
    this.results.clear();
  }
}

// Singleton instance
export const queueService = new QueueService();

