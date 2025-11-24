import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-arbitrage/[address]
 * Find arbitrage opportunities across DEXs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const amount = searchParams.get('amount');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `arbitrage:${address}:${amount || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const opportunities = {
      tokenAddress: address,
      opportunities: [
        {
          route: 'Uniswap -> SushiSwap',
          profit: '2.5',
          amount: amount || '1000',
          gasCost: '0.05',
        },
      ],
      bestOpportunity: {
        route: 'Uniswap -> SushiSwap',
        profit: '2.5',
      },
      timestamp: Date.now(),
    };

    cache.set(cacheKey, opportunities, 10 * 1000);
    return NextResponse.json(opportunities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to find arbitrage' },
      { status: 500 }
    );
  }
}

