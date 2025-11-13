import { NextRequest } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import { getPortfolioData } from '@/lib/services';
import { createSuccessResponse } from '@/lib/utils/response-handlers';
import { withErrorHandling } from '@/lib/utils/error-handler';
import { validateAddressOrThrow } from '@/lib/utils/validation-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio/[address]
 * Get portfolio value and token breakdown for a wallet address
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing address
 * @returns Portfolio data including total value, chain breakdown, and top tokens
 * 
 * @example
 * ```bash
 * GET /api/portfolio/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * ```
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Validate address (throws AppError if invalid)
  const normalizedAddress = validateAddressOrThrow(address);
  
  const cacheKey = `portfolio:${normalizedAddress}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return createSuccessResponse({ ...cachedResult, cached: true });
  }

  // Get portfolio data using service
  const result = await getPortfolioData(normalizedAddress);

  // Cache for 5 minutes
  cache.set(cacheKey, result, CACHE_TTL.PORTFOLIO);

  return createSuccessResponse(result);
}

// Export with error handling wrapper
export const GET = withErrorHandling(getHandler);
