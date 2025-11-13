/**
 * Reminders Service
 * Business logic for managing airdrop reminders
 * 
 * @module RemindersService
 */

import type { Reminder, ReminderType } from '@airdrop-finder/shared';

/**
 * Create a new reminder
 * 
 * @param data - Reminder data
 * @returns Created reminder
 * @throws {Error} If validation fails or creation fails
 * 
 * @example
 * ```typescript
 * const reminder = await RemindersService.createReminder({
 *   address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   type: 'claim',
 *   reminderTime: new Date(Date.now() + 86400000).toISOString(),
 *   message: 'Claim your airdrop',
 * });
 * ```
 */
export class RemindersService {
  private static reminders = new Map<string, Reminder>();

  static async createReminder(data: {
    address: string;
    projectId?: string;
    projectName?: string;
    type: ReminderType;
    reminderTime: string;
    message: string;
  }): Promise<Reminder> {
    const reminder: Reminder = {
      id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: data.address.toLowerCase(),
      projectId: data.projectId,
      projectName: data.projectName,
      type: data.type,
      reminderTime: data.reminderTime,
      message: data.message,
      enabled: true,
      createdAt: new Date().toISOString(),
      sent: false,
    };

    const userReminders = this.reminders.get(reminder.address) || [];
    userReminders.push(reminder);
    this.reminders.set(reminder.address, userReminders);

    return reminder;
  }

  /**
   * Get reminders for an address
   * 
   * @param address - Ethereum address
   * @param filters - Optional filters
   * @returns Array of reminders
   */
  static async getReminders(
    address: string,
    filters?: {
      type?: ReminderType;
      enabled?: boolean;
      upcoming?: boolean;
    }
  ): Promise<Reminder[]> {
    const reminders = this.reminders.get(address.toLowerCase()) || [];

    let filtered = reminders;

    if (filters?.type) {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    if (filters?.enabled !== undefined) {
      filtered = filtered.filter((r) => r.enabled === filters.enabled);
    }

    if (filters?.upcoming) {
      const now = new Date();
      filtered = filtered.filter((r) => new Date(r.reminderTime) > now);
    }

    return filtered;
  }

  /**
   * Get a single reminder by ID
   * 
   * @param id - Reminder ID
   * @returns Reminder or null if not found
   */
  static async getReminder(id: string): Promise<Reminder | null> {
    for (const reminders of this.reminders.values()) {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder) {
        return reminder;
      }
    }
    return null;
  }

  /**
   * Update a reminder
   * 
   * @param id - Reminder ID
   * @param updates - Update data
   * @returns Updated reminder or null if not found
   */
  static async updateReminder(
    id: string,
    updates: Partial<Omit<Reminder, 'id' | 'address' | 'createdAt'>>
  ): Promise<Reminder | null> {
    for (const reminders of this.reminders.values()) {
      const index = reminders.findIndex((r) => r.id === id);
      if (index !== -1) {
        reminders[index] = { ...reminders[index], ...updates };
        return reminders[index];
      }
    }
    return null;
  }

  /**
   * Delete a reminder
   * 
   * @param id - Reminder ID
   * @returns True if deleted, false if not found
   */
  static async deleteReminder(id: string): Promise<boolean> {
    for (const reminders of this.reminders.values()) {
      const index = reminders.findIndex((r) => r.id === id);
      if (index !== -1) {
        reminders.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Mark reminder as sent
   * 
   * @param id - Reminder ID
   * @returns Updated reminder or null if not found
   */
  static async markAsSent(id: string): Promise<Reminder | null> {
    return this.updateReminder(id, { sent: true });
  }

  /**
   * Get reminders that are due
   * 
   * @returns Array of due reminders
   */
  static async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const due: Reminder[] = [];

    for (const reminders of this.reminders.values()) {
      reminders.forEach((reminder) => {
        if (reminder.enabled && !reminder.sent && new Date(reminder.reminderTime) <= now) {
          due.push(reminder);
        }
      });
    }

    return due;
  }

  /**
   * Get reminder statistics for an address
   * 
   * @param address - Ethereum address
   * @returns Statistics object
   */
  static async getStatistics(address: string): Promise<{
    total: number;
    byType: Record<ReminderType, number>;
    enabled: number;
    sent: number;
  }> {
    const reminders = await this.getReminders(address.toLowerCase());

    const byType: Record<ReminderType, number> = {
      snapshot: 0,
      claim: 0,
      announcement: 0,
      custom: 0,
    };

    reminders.forEach((reminder) => {
      byType[reminder.type] = (byType[reminder.type] || 0) + 1;
    });

    return {
      total: reminders.length,
      byType,
      enabled: reminders.filter((r) => r.enabled).length,
      sent: reminders.filter((r) => r.sent).length,
    };
  }
}
