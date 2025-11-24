/**
 * Web Worker utilities
 */

export type WorkerTask<T, R> = (data: T) => R | Promise<R>;

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private activeWorkers: Set<Worker> = new Set();

  constructor(workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
      this.setupWorker(worker);
    }
  }

  private setupWorker(worker: Worker): void {
    worker.onmessage = (event) => {
      const { result, error } = event.data;
      
      this.activeWorkers.delete(worker);

      if (error) {
        // Handle error
        if (this.queue.length > 0) {
          const { reject } = this.queue.shift()!;
          reject(new Error(error));
        }
      } else {
        // Handle success
        if (this.queue.length > 0) {
          const { resolve } = this.queue.shift()!;
          resolve(result);
        }
      }

      // Process next task
      this.processQueue();
    };

    worker.onerror = (error) => {
      this.activeWorkers.delete(worker);
      
      if (this.queue.length > 0) {
        const { reject } = this.queue.shift()!;
        reject(error);
      }

      this.processQueue();
    };
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(
      (worker) => !this.activeWorkers.has(worker)
    );

    if (availableWorker) {
      const task = this.queue[0];
      this.activeWorkers.add(availableWorker);
      availableWorker.postMessage(task.data);
    }
  }

  execute<T, R>(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  terminate(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.queue = [];
    this.activeWorkers.clear();
  }
}

export function createInlineWorker(fn: Function): Worker {
  const blob = new Blob(
    [
      `
      self.onmessage = function(e) {
        try {
          const result = (${fn.toString()})(e.data);
          self.postMessage({ result });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      }
    `,
    ],
    { type: "application/javascript" }
  );

  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

export async function runInWorker<T, R>(fn: WorkerTask<T, R>, data: T): Promise<R> {
  const worker = createInlineWorker(fn);

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      const { result, error } = event.data;
      worker.terminate();

      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    worker.postMessage(data);
  });
}

