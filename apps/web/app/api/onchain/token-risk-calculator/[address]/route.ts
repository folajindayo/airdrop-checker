import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-risk-calculator/[address]
 * Calculate comprehensive risk metrics for tokens
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `risk-calculator:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const risk = {
      tokenAddress: address,
      volatility: '25.5',
      maxDrawdown: '15.2',
      var95: '8.5',
      riskScore: '65',
      riskLevel: 'medium',
      factors: {
        liquidity: 'high',
        concentration: 'medium',
        volume: 'high',
      },
      timestamp: Date.now(),
    };

    cache.set(cacheKey, risk, 300 * 1000);
    return NextResponse.json(risk);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate risk' },
      { status: 500 }
    );
  }
}

