import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress, cache, CACHE_TTL } from '@airdrop-finder/shared';
import type { CheckResult } from '@airdrop-finder/shared';
import { checkAirdropEligibility } from '@/lib/services';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/utils/response-handlers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/airdrop-check/[address]
 * Check airdrop eligibility for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address
    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const normalizedAddress = address.toLowerCase();

    // Check cache first
    const cacheKey = `airdrop-check:${normalizedAddress}`;
    const cachedResult = cache.get<CheckResult>(cacheKey);

    if (cachedResult) {
      return createSuccessResponse({
        ...cachedResult,
        cached: true,
      });
    }

    // Check eligibility using service
    const result = await checkAirdropEligibility(normalizedAddress);

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.AIRDROP_CHECK);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error checking airdrop eligibility:', error);
    return createErrorResponse(error as Error);
  }
}

