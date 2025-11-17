import { RemindersService } from '@/lib/services';

describe('RemindersService', () => {
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  it('should create reminder', async () => {
    const reminder = await RemindersService.createReminder({
      address: testAddress,
      type: 'claim',
      reminderTime: new Date(Date.now() + 86400000).toISOString(),
      message: 'Test reminder',
    });

    expect(reminder.id).toBeDefined();
    expect(reminder.type).toBe('claim');
  });

  it('should get reminders for address', async () => {
    const reminders = await RemindersService.getReminders(testAddress);
    expect(Array.isArray(reminders)).toBe(true);
  });

  it('should get statistics', async () => {
    const stats = await RemindersService.getStatistics(testAddress);
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('upcoming');
  });
});



