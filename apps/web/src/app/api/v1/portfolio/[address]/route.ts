import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, rateLimitMiddleware } from '../../_middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/portfolio/[address]
 * Get detailed portfolio for a specific address
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const { address } = params;
    const { searchParams } = new URL(req.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const timeRange = searchParams.get('timeRange') || '7d';

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    return {
      success: true,
      data: {
        address,
        portfolio: {
          totalValue: 0,
          tokens: [],
          nfts: [],
          defiPositions: [],
        },
        performance: includeHistory ? {
          timeRange,
          data: [],
        } : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

