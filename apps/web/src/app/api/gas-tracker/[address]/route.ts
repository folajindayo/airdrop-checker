import { NextRequest } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import { getGasTrackerData } from '@/lib/services';
import { createSuccessResponse } from '@/lib/utils/response-handlers';
import { withErrorHandling } from '@/lib/utils/error-handler';
import { validateAddressOrThrow } from '@/lib/utils/validation-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gas-tracker/[address]
 * Track gas spending for a wallet address
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing address
 * @returns Gas tracker data including total spent, chain breakdown, and monthly breakdown
 * 
 * @example
 * ```bash
 * GET /api/gas-tracker/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * ```
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Validate address (throws AppError if invalid)
  const normalizedAddress = validateAddressOrThrow(address);
  
  const cacheKey = `gas-tracker:${normalizedAddress}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return createSuccessResponse({ ...cached, cached: true });
  }
  
  const result = await getGasTrackerData(normalizedAddress);
  cache.set(cacheKey, result, CACHE_TTL.GAS_TRACKER);
  
  return createSuccessResponse(result);
}

// Export with error handling wrapper
export const GET = withErrorHandling(getHandler);
