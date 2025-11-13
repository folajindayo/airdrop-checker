/**
 * Tests for SchedulerService
 */

import { SchedulerService } from '@/lib/services/scheduler.service';

describe('SchedulerService', () => {
  describe('getTasks', () => {
    it('should get all scheduled tasks', async () => {
      const tasks = await SchedulerService.getTasks();

      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('createTask', () => {
    it('should create a scheduled task', async () => {
      const task = await SchedulerService.createTask({
        name: 'Test Task',
        cron: '0 0 * * *',
        enabled: true,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.enabled).toBe(true);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const task = await SchedulerService.createTask({
        name: 'Test Task',
        cron: '0 0 * * *',
        enabled: true,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
      });

      const updated = await SchedulerService.updateTask(task.id, { enabled: false });

      expect(updated).toBeDefined();
      expect(updated?.enabled).toBe(false);
    });

    it('should return null for non-existent task', async () => {
      const updated = await SchedulerService.updateTask('non-existent-id', { enabled: false });

      expect(updated).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const task = await SchedulerService.createTask({
        name: 'Test Task',
        cron: '0 0 * * *',
        enabled: true,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
      });

      const deleted = await SchedulerService.deleteTask(task.id);

      expect(deleted).toBe(true);
    });

    it('should return false for non-existent task', async () => {
      const deleted = await SchedulerService.deleteTask('non-existent-id');

      expect(deleted).toBe(false);
    });
  });
});

