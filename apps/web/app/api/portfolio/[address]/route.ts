import { NextRequest } from 'next/server';
import { isValidAddress, cache, CACHE_TTL } from '@airdrop-finder/shared';
import { getPortfolioData } from '@/lib/services';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/utils/response-handlers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio/[address]
 * Get portfolio value and token breakdown for a wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return createValidationErrorResponse('Invalid Ethereum address');
    }

    const normalizedAddress = address.toLowerCase();
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
  } catch (error) {
    console.error('Portfolio API error:', error);
    return createErrorResponse(error as Error);
  }
}
