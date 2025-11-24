/**
 * Route handler helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '../utils/response-handlers';

/**
 * Standard route handler with caching
 */
export function createCachedHandler<T>(
  handler: (address: string) => Promise<T>,
  cacheKeyPrefix: string,
  ttl: number
) {
  return async (request: NextRequest, { params }: { params: Promise<{ address: string }> }) => {
    try {
      const { address } = await params;
      
      const cacheKey = `${cacheKeyPrefix}:${address.toLowerCase()}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return createSuccessResponse({ ...cached, cached: true });
      }
      
      const result = await handler(address);
      cache.set(cacheKey, result, ttl);
      
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  };
}

/**
 * Validate address parameter
 */
export async function validateAddressParam(
  params: Promise<{ address: string }>
): Promise<{ address: string; error?: NextResponse }> {
  const { address } = await params;
  
  if (!address) {
    return {
      address: '',
      error: createValidationErrorResponse('Address parameter is required'),
    };
  }
  
  return { address };
}

