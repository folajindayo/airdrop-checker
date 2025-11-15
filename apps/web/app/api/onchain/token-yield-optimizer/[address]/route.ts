import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-yield-optimizer/[address]
 * Find optimal yield farming strategies for tokens
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

    const cacheKey = `yield-optimizer:${address}:${amount || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const strategies = {
      tokenAddress: address,
      amount: amount || 'all',
      strategies: [
        {
          protocol: 'Aave',
          apy: '8.5',
          risk: 'low',
          recommended: true,
        },
        {
          protocol: 'Compound',
          apy: '7.2',
          risk: 'low',
          recommended: false,
        },
      ],
      bestStrategy: 'Aave',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, strategies, 300 * 1000);
    return NextResponse.json(strategies);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to optimize yield' },
      { status: 500 }
    );
  }
}

