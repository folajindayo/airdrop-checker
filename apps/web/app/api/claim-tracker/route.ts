import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { ClaimTrackerService } from '@/lib/services';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
} from '@/lib/utils/response-handlers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/claim-tracker
 * Add a new airdrop claim entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, projectId, projectName, status, amount, valueUSD, txHash, notes } = body;

    // Validate required fields
    if (!address || !projectId || !projectName) {
      return createValidationErrorResponse('Address, projectId, and projectName are required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const validStatuses = ['claimed', 'pending', 'failed'];
    if (!validStatuses.includes(status)) {
      return createValidationErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Add claim using service
    const claim = await ClaimTrackerService.addClaim({
      address,
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
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * GET /api/claim-tracker?address=0x...&status=claimed
 * Get all claims for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const status = searchParams.get('status') || undefined;
    const projectId = searchParams.get('projectId') || undefined;

    if (!address) {
      return createValidationErrorResponse('Address is required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    // Get claims and statistics
    const claims = await ClaimTrackerService.getClaims(address, { status, projectId });
    const stats = await ClaimTrackerService.getStatistics(address);

    return createSuccessResponse({
      claims,
      stats,
      count: claims.length,
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * PATCH /api/claim-tracker
 * Update a claim entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, address, ...updates } = body;

    if (!id || !address) {
      return createValidationErrorResponse('ID and address are required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const claim = await ClaimTrackerService.updateClaim(address, id, updates);

    if (!claim) {
      return createNotFoundResponse('Claim');
    }

    return createSuccessResponse({
      claim,
      message: 'Claim updated successfully',
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * DELETE /api/claim-tracker?id=...&address=0x...
 * Delete a claim entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const address = searchParams.get('address');

    if (!id || !address) {
      return createValidationErrorResponse('ID and address are required');
    }

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const deleted = await ClaimTrackerService.deleteClaim(address, id);

    if (!deleted) {
      return createNotFoundResponse('Claim');
    }

    return createSuccessResponse({
      message: 'Claim deleted successfully',
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return createErrorResponse(error as Error);
  }
}



