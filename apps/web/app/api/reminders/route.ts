import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { RemindersService, type ReminderType } from '@/lib/services';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
} from '@/lib/utils/response-handlers';
import { withErrorHandling, AppError, ErrorCode } from '@/lib/utils/error-handler';
import { validateAddressOrThrow, validateRequiredOrThrow, validateEnumOrThrow } from '@/lib/utils/validation-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reminders
 * Create a new reminder
 * 
 * @param request - Next.js request object with reminder data in body
 * @returns Created reminder
 * 
 * @example
 * ```bash
 * POST /api/reminders
 * {
 *   "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   "type": "claim",
 *   "reminderTime": "2024-02-01T00:00:00Z",
 *   "message": "Claim your airdrop"
 * }
 * ```
 */
async function postHandler(request: NextRequest) {
  const body = await request.json();
  const { address, projectId, projectName, type, reminderTime, message } = body;

  // Validate required fields
  validateRequiredOrThrow(address, 'address');
  validateRequiredOrThrow(reminderTime, 'reminderTime');
  validateRequiredOrThrow(message, 'message');

  // Validate address
  const normalizedAddress = validateAddressOrThrow(address);

  // Validate reminder time
  const reminderDate = new Date(reminderTime);
  if (isNaN(reminderDate.getTime())) {
    throw new AppError(
      'Invalid reminderTime format. Use ISO 8601 format.',
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  if (reminderDate < new Date()) {
    throw new AppError(
      'Reminder time must be in the future',
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  // Validate type
  const validTypes: ReminderType[] = ['snapshot', 'claim', 'announcement', 'custom'];
  validateEnumOrThrow(type, validTypes, 'type');

  const reminder = await RemindersService.createReminder({
    address: normalizedAddress,
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
}

/**
 * GET /api/reminders?address=0x...&type=claim&upcoming=true
 * Get reminders for an address
 * 
 * @param request - Next.js request object with query parameters
 * @returns Array of reminders and statistics
 * 
 * @example
 * ```bash
 * GET /api/reminders?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&type=claim
 * ```
 */
async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const type = searchParams.get('type') || undefined;
  const enabled = searchParams.get('enabled');
  const upcoming = searchParams.get('upcoming') === 'true';

  // Validate address
  validateRequiredOrThrow(address, 'address');
  const normalizedAddress = validateAddressOrThrow(address!);

  const reminders = await RemindersService.getReminders(normalizedAddress, {
    type: type as ReminderType | undefined,
    enabled: enabled ? enabled === 'true' : undefined,
    upcoming,
  });

  const stats = await RemindersService.getStatistics(normalizedAddress);

  return createSuccessResponse({
    reminders,
    stats,
    count: reminders.length,
  });
}

/**
 * PATCH /api/reminders
 * Update a reminder
 * 
 * @param request - Next.js request object with update data in body
 * @returns Updated reminder
 * 
 * @example
 * ```bash
 * PATCH /api/reminders
 * {
 *   "id": "reminder-123",
 *   "enabled": false
 * }
 * ```
 */
async function patchHandler(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  validateRequiredOrThrow(id, 'id');

  const reminder = await RemindersService.updateReminder(id, updates);

  if (!reminder) {
    return createNotFoundResponse('Reminder');
  }

  return createSuccessResponse({
    reminder,
    message: 'Reminder updated successfully',
  });
}

/**
 * DELETE /api/reminders?id=...
 * Delete a reminder
 * 
 * @param request - Next.js request object with id in query parameters
 * @returns Success message
 * 
 * @example
 * ```bash
 * DELETE /api/reminders?id=reminder-123
 * ```
 */
async function deleteHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  validateRequiredOrThrow(id, 'id');

  const deleted = await RemindersService.deleteReminder(id!);

  if (!deleted) {
    return createNotFoundResponse('Reminder');
  }

  return createSuccessResponse({
    message: 'Reminder deleted successfully',
  });
}

// Export with error handling wrappers
export const POST = withErrorHandling(postHandler);
export const GET = withErrorHandling(getHandler);
export const PATCH = withErrorHandling(patchHandler);
export const DELETE = withErrorHandling(deleteHandler);






