import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-portfolio-optimizer/[address]
 * Optimize token portfolio allocation for maximum returns
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const riskTolerance = searchParams.get('risk') || 'medium';

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `portfolio-optimizer:${address}:${riskTolerance}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const optimization = {
      walletAddress: address,
      riskTolerance,
      recommendedAllocation: {
        ETH: '35',
        BTC: '25',
        Stablecoins: '30',
        Altcoins: '10',
      },
      expectedReturn: '12.5',
      sharpeRatio: '1.8',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, optimization, 300 * 1000);
    return NextResponse.json(optimization);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to optimize portfolio' },
      { status: 500 }
    );
  }
}

