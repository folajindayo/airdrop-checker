/**
 * Cache middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';
import { addCacheHeaders } from '../utils/response-handlers';

/**
 * Cache decorator for GET requests
 */
export function withCache(
  cacheKeyFn: (request: NextRequest, params: any) => string,
  ttl: number
) {
  return function <T>(
    handler: (request: NextRequest, params: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, params: T): Promise<NextResponse> => {
      // Only cache GET requests
      if (request.method !== 'GET') {
        return handler(request, params);
      }
      
      const cacheKey = cacheKeyFn(request, params);
      const cached = cache.get(cacheKey);
      
      if (cached) {
        const response = NextResponse.json({
          ...cached,
          cached: true,
        });
        return addCacheHeaders(response, ttl / 1000);
      }
      
      const response = await handler(request, params);
      
      if (response.ok) {
        const data = await response.json();
        cache.set(cacheKey, data, ttl);
      }
      
      return response;
    };
  };
}

