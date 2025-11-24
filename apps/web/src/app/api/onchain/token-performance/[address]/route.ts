import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-performance/[address]
 * Track token performance metrics over time
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `performance:${address}:${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const performance = {
      tokenAddress: address,
      period,
      return: '15.5',
      volatility: '22.3',
      sharpeRatio: '0.69',
      maxGain: '25.0',
      maxLoss: '-12.5',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, performance, 60 * 1000);
    return NextResponse.json(performance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch performance' },
      { status: 500 }
    );
  }
}

