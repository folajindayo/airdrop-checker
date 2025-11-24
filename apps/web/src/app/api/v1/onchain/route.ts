import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, rateLimitMiddleware } from '../_middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/onchain
 * Get onchain data and metrics
 */
export async function GET(req: NextRequest) {
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature');
    const chain = searchParams.get('chain') || 'ethereum';

    return {
      success: true,
      data: {
        chain,
        feature,
        available: [
          'wallet-score',
          'token-holdings',
          'nft-analysis',
          'defi-positions',
          'transaction-history',
          'gas-optimization',
          'security-score',
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  })(req);
}

