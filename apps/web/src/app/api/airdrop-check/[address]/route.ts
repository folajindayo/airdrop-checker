import { NextRequest, NextResponse } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import type { CheckResult } from '@airdrop-finder/shared';
import { checkAirdropEligibility } from '@/lib/services';
import { createSuccessResponse } from '@/lib/utils/response-handlers';
import { withErrorHandling } from '@/lib/utils/error-handler';
import { validateAddressOrThrow } from '@/lib/utils/validation-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/airdrop-check/[address]
 * Check airdrop eligibility for a wallet address
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Validate address (throws AppError if invalid)
  const normalizedAddress = validateAddressOrThrow(address);

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
}

// Export with error handling wrapper
export const GET = withErrorHandling(getHandler);

