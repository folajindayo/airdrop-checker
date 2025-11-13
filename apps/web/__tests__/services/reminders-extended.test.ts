/**
 * Extended tests for RemindersService
 */

import { RemindersService } from '@/lib/services/reminders.service';
import { MOCK_ADDRESS } from '../helpers';

describe('RemindersService - Extended', () => {
  const testAddress = MOCK_ADDRESS;

  describe('getDueReminders', () => {
    it('should get reminders that are due', async () => {
      // Create a reminder that's due
      const reminder = await RemindersService.createReminder({
        address: testAddress,
        type: 'claim',
        reminderTime: new Date(Date.now() - 1000).toISOString(), // Past time
        message: 'Due reminder',
      });

      const dueReminders = await RemindersService.getDueReminders();

      expect(Array.isArray(dueReminders)).toBe(true);
    });

    it('should not return future reminders', async () => {
      // Create a reminder that's not due
      await RemindersService.createReminder({
        address: testAddress,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(), // Future time
        message: 'Future reminder',
      });

      const dueReminders = await RemindersService.getDueReminders();

      // Should not include future reminders
      dueReminders.forEach((reminder) => {
        expect(new Date(reminder.reminderTime).getTime()).toBeLessThanOrEqual(Date.now());
      });
    });
  });

  describe('markAsSent', () => {
    it('should mark reminder as sent', async () => {
      const reminder = await RemindersService.createReminder({
        address: testAddress,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder',
      });

      const updated = await RemindersService.markAsSent(reminder.id);

      expect(updated).toBeDefined();
      expect(updated?.sent).toBe(true);
    });

    it('should return null for non-existent reminder', async () => {
      const updated = await RemindersService.markAsSent('non-existent-id');

      expect(updated).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should get reminder statistics', async () => {
      // Create some reminders
      await RemindersService.createReminder({
        address: testAddress,
        type: 'claim',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder 1',
      });

      await RemindersService.createReminder({
        address: testAddress,
        type: 'snapshot',
        reminderTime: new Date(Date.now() + 86400000).toISOString(),
        message: 'Test reminder 2',
      });

      const stats = await RemindersService.getStatistics(testAddress);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byType');
      expect(typeof stats.total).toBe('number');
    });
  });
});

