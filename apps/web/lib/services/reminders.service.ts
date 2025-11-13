/**
 * Reminders Service
 * Business logic for managing airdrop reminders
 */

export interface Reminder {
  id: string;
  address: string;
  projectId?: string;
  projectName?: string;
  type: 'snapshot' | 'claim' | 'announcement' | 'custom';
  reminderTime: string; // ISO 8601 timestamp
  message: string;
  enabled: boolean;
  createdAt: string;
  sent: boolean;
  sentAt?: string;
}

export type ReminderType = Reminder['type'];

// In-memory storage (in production, use database)
const remindersStore = new Map<string, Reminder>();

export class RemindersService {
  /**
   * Create a new reminder
   */
  static async createReminder(data: {
    address: string;
    projectId?: string;
    projectName?: string;
    type: ReminderType;
    reminderTime: string;
    message: string;
  }): Promise<Reminder> {
    const normalizedAddress = data.address.toLowerCase();
    const reminderDate = new Date(data.reminderTime);

    const id = `reminder-${normalizedAddress}-${Date.now()}`;
    const reminder: Reminder = {
      id,
      address: normalizedAddress,
      projectId: data.projectId,
      projectName: data.projectName,
      type: data.type,
      reminderTime: reminderDate.toISOString(),
      message: data.message,
      enabled: true,
      createdAt: new Date().toISOString(),
      sent: false,
    };

    remindersStore.set(id, reminder);
    return reminder;
  }

  /**
   * Get reminders for an address
   */
  static async getReminders(address: string, filters?: {
    type?: string;
    enabled?: boolean;
    upcoming?: boolean;
  }): Promise<Reminder[]> {
    const normalizedAddress = address.toLowerCase();
    let results: Reminder[] = [];

    for (const reminder of remindersStore.values()) {
      if (reminder.address === normalizedAddress) {
        results.push(reminder);
      }
    }

    // Apply filters
    if (filters?.type) {
      results = results.filter((r) => r.type === filters.type);
    }

    if (filters?.enabled !== undefined) {
      results = results.filter((r) => r.enabled === filters.enabled);
    }

    if (filters?.upcoming) {
      const now = new Date();
      results = results.filter((r) => !r.sent && new Date(r.reminderTime) > now);
    }

    // Sort by reminder time (soonest first)
    results.sort((a, b) => 
      new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime()
    );

    return results;
  }

  /**
   * Get a single reminder by ID
   */
  static async getReminder(id: string): Promise<Reminder | null> {
    return remindersStore.get(id) || null;
  }

  /**
   * Update a reminder
   */
  static async updateReminder(
    id: string,
    updates: Partial<Omit<Reminder, 'id' | 'address' | 'createdAt'>>
  ): Promise<Reminder | null> {
    const reminder = remindersStore.get(id);

    if (!reminder) {
      return null;
    }

    const updated: Reminder = {
      ...reminder,
      ...updates,
    };

    remindersStore.set(id, updated);
    return updated;
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(id: string): Promise<boolean> {
    return remindersStore.delete(id);
  }

  /**
   * Mark reminder as sent
   */
  static async markAsSent(id: string): Promise<Reminder | null> {
    const reminder = remindersStore.get(id);

    if (!reminder) {
      return null;
    }

    reminder.sent = true;
    reminder.sentAt = new Date().toISOString();
    remindersStore.set(id, reminder);

    return reminder;
  }

  /**
   * Get due reminders (for background job)
   */
  static async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    const due: Reminder[] = [];

    for (const reminder of remindersStore.values()) {
      if (
        reminder.enabled &&
        !reminder.sent &&
        new Date(reminder.reminderTime) <= now
      ) {
        due.push(reminder);
      }
    }

    return due;
  }

  /**
   * Get reminder statistics for an address
   */
  static async getStatistics(address: string): Promise<{
    total: number;
    upcoming: number;
    sent: number;
    enabled: number;
    disabled: number;
  }> {
    const reminders = await this.getReminders(address);
    const now = new Date();

    return {
      total: reminders.length,
      upcoming: reminders.filter((r) => !r.sent && new Date(r.reminderTime) > now).length,
      sent: reminders.filter((r) => r.sent).length,
      enabled: reminders.filter((r) => r.enabled).length,
      disabled: reminders.filter((r) => !r.enabled).length,
    };
  }
}

