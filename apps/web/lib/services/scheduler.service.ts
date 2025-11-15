/**
 * Scheduler Service for managing scheduled tasks
 */

export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

export class SchedulerService {
  private static tasks = new Map<string, ScheduledTask>();

  static async getTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.tasks.values());
  }

  static async createTask(task: Omit<ScheduledTask, 'id'>): Promise<ScheduledTask> {
    const id = `task-${Date.now()}`;
    const newTask = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  static async updateTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null> {
    const task = this.tasks.get(id);
    if (!task) return null;
    
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  static async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}


