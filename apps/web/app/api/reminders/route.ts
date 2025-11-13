import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { RemindersService, ReminderType } from '@/lib/services';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
} from '@/lib/utils/response-handlers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reminders
 * Create a new reminder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, projectId, projectName, type, reminderTime, message } = body;

    if (!address || !reminderTime || !message) {
      return createValidationErrorResponse('Address, reminderTime, and message are required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const reminderDate = new Date(reminderTime);
    if (isNaN(reminderDate.getTime())) {
      return createValidationErrorResponse('Invalid reminderTime format. Use ISO 8601 format.');
    }

    if (reminderDate < new Date()) {
      return createValidationErrorResponse('Reminder time must be in the future');
    }

    const validTypes: ReminderType[] = ['snapshot', 'claim', 'announcement', 'custom'];
    if (!validTypes.includes(type)) {
      return createValidationErrorResponse(`Type must be one of: ${validTypes.join(', ')}`);
    }

    const reminder = await RemindersService.createReminder({
      address,
      projectId,
      projectName,
      type,
      reminderTime,
      message,
    });

    return createSuccessResponse({
      reminder,
      message: 'Reminder created successfully',
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * GET /api/reminders?address=0x...&type=claim&upcoming=true
 * Get reminders for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const type = searchParams.get('type') || undefined;
    const enabled = searchParams.get('enabled');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (!address) {
      return createValidationErrorResponse('Address is required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const reminders = await RemindersService.getReminders(address, {
      type,
      enabled: enabled ? enabled === 'true' : undefined,
      upcoming,
    });

    const stats = await RemindersService.getStatistics(address);

    return createSuccessResponse({
      reminders,
      stats,
      count: reminders.length,
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * PATCH /api/reminders
 * Update a reminder
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return createValidationErrorResponse('Reminder ID is required');
    }

    const reminder = await RemindersService.updateReminder(id, updates);

    if (!reminder) {
      return createValidationErrorResponse('Reminder not found', 404);
    }

    return createSuccessResponse({
      reminder,
      message: 'Reminder updated successfully',
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * DELETE /api/reminders?id=...
 * Delete a reminder
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createValidationErrorResponse('Reminder ID is required');
    }

    const deleted = await RemindersService.deleteReminder(id);

    if (!deleted) {
      return createValidationErrorResponse('Reminder not found', 404);
    }

    return createSuccessResponse({
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Reminders API error:', error);
    return createErrorResponse(error as Error);
  }
}
