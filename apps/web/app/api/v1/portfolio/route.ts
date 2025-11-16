import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, rateLimitMiddleware } from '../_middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/portfolio
 * Get portfolio overview for an address
 */
export async function GET(req: NextRequest) {
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const chains = searchParams.get('chains')?.split(',');
    const includeNfts = searchParams.get('includeNfts') === 'true';

    if (!address) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Address is required' },
        { status: 400 }
      );
    }

    return {
      success: true,
      data: {
        address,
        totalValue: 0,
        tokens: [],
        nfts: includeNfts ? [] : undefined,
        defiPositions: [],
        chains: chains || [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

/**
 * POST /api/v1/portfolio/compare
 * Compare multiple portfolios
 */
export async function POST(req: NextRequest) {
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const body = await req.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses) || addresses.length < 2) {
      return NextResponse.json(
        { error: 'Validation error', message: 'At least 2 addresses are required' },
        { status: 400 }
      );
    }

    return {
      success: true,
      data: {
        addresses,
        comparison: {
          portfolios: [],
          similarities: [],
          differences: [],
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

