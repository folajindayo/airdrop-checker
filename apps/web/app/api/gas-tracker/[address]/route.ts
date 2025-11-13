import { NextRequest } from 'next/server';
import { isValidAddress, cache, CACHE_TTL } from '@airdrop-finder/shared';
import { getGasTrackerData } from '@/lib/services';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '@/lib/utils/response-handlers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gas-tracker/[address]
 * Track gas spending for a wallet address
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
    const cacheKey = `gas-tracker:${normalizedAddress}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return createSuccessResponse({ ...cached, cached: true });
    }
    
    const result = await getGasTrackerData(normalizedAddress);
    cache.set(cacheKey, result, CACHE_TTL.GAS_TRACKER);
    
    return createSuccessResponse(result);
  } catch (error) {
    console.error('Gas tracker API error:', error);
    return createErrorResponse(error as Error);
  }
}
