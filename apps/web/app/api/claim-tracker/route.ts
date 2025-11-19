import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { ClaimTrackerService } from '@/lib/services';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
} from '@/lib/utils/response-handlers';
import { withErrorHandling } from '@/lib/utils/error-handler';
import {
  validateAddressOrThrow,
  validateRequiredOrThrow,
  validateEnumOrThrow,
} from '@/lib/utils/validation-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/claim-tracker
 * Add a new airdrop claim entry
 * 
 * @param request - Next.js request object with claim data in body
 * @returns Created claim entry
 * 
 * @example
 * ```bash
 * POST /api/claim-tracker
 * {
 *   "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   "projectId": "zora",
 *   "projectName": "Zora",
 *   "status": "claimed"
 * }
 * ```
 */
async function postHandler(request: NextRequest) {
  const body = await request.json();
  const { address, projectId, projectName, status, amount, valueUSD, txHash, notes } = body;

  // Validate required fields
  validateRequiredOrThrow(address, 'address');
  validateRequiredOrThrow(projectId, 'projectId');
  validateRequiredOrThrow(projectName, 'projectName');

  // Validate address
  const normalizedAddress = validateAddressOrThrow(address);

  // Validate status
  const validStatuses = ['claimed', 'pending', 'failed'];
  validateEnumOrThrow(status, validStatuses, 'status');

  // Add claim using service
  const claim = await ClaimTrackerService.addClaim({
    address: normalizedAddress,
    projectId,
    projectName,
    status,
    amount,
    valueUSD,
    txHash,
    notes,
  });

  return createSuccessResponse({
    claim,
    message: 'Claim entry added successfully',
  });
}

/**
 * GET /api/claim-tracker?address=0x...&status=claimed
 * Get all claims for an address
 * 
 * @param request - Next.js request object with query parameters
 * @returns Array of claims and statistics
 * 
 * @example
 * ```bash
 * GET /api/claim-tracker?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&status=claimed
 * ```
 */
async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const status = searchParams.get('status') || undefined;
  const projectId = searchParams.get('projectId') || undefined;

  // Validate address
  validateRequiredOrThrow(address, 'address');
  const normalizedAddress = validateAddressOrThrow(address!);

  // Get claims and statistics
  const claims = await ClaimTrackerService.getClaims(normalizedAddress, { status, projectId });
  const stats = await ClaimTrackerService.getStatistics(normalizedAddress);

  return createSuccessResponse({
    claims,
    stats,
    count: claims.length,
  });
}

/**
 * PATCH /api/claim-tracker
 * Update a claim entry
 * 
 * @param request - Next.js request object with update data in body
 * @returns Updated claim entry
 * 
 * @example
 * ```bash
 * PATCH /api/claim-tracker
 * {
 *   "id": "claim-123",
 *   "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   "status": "claimed"
 * }
 * ```
 */
async function patchHandler(request: NextRequest) {
  const body = await request.json();
  const { id, address, ...updates } = body;

  validateRequiredOrThrow(id, 'id');
  validateRequiredOrThrow(address, 'address');
  const normalizedAddress = validateAddressOrThrow(address);

  const claim = await ClaimTrackerService.updateClaim(normalizedAddress, id, updates);

  if (!claim) {
    return createNotFoundResponse('Claim');
  }

  return createSuccessResponse({
    claim,
    message: 'Claim updated successfully',
  });
}

/**
 * DELETE /api/claim-tracker?id=...&address=0x...
 * Delete a claim entry
 * 
 * @param request - Next.js request object with id and address in query parameters
 * @returns Success message
 * 
 * @example
 * ```bash
 * DELETE /api/claim-tracker?id=claim-123&address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * ```
 */
async function deleteHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const address = searchParams.get('address');

  validateRequiredOrThrow(id, 'id');
  validateRequiredOrThrow(address, 'address');
  const normalizedAddress = validateAddressOrThrow(address!);

  const deleted = await ClaimTrackerService.deleteClaim(normalizedAddress, id!);

  if (!deleted) {
    return createNotFoundResponse('Claim');
  }

  return createSuccessResponse({
    message: 'Claim deleted successfully',
  });
}

// Export with error handling wrappers
export const POST = withErrorHandling(postHandler);
export const GET = withErrorHandling(getHandler);
export const PATCH = withErrorHandling(patchHandler);
export const DELETE = withErrorHandling(deleteHandler);






