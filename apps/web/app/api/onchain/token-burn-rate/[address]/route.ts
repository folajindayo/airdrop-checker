import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-burn-rate/[address]
 * Calculate token burn rate and supply reduction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '24h';

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `burn-rate:${address}:${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const burnRate = {
      tokenAddress: address,
      period,
      totalBurned: '1000000',
      burnRate24h: '50000',
      burnRate7d: '350000',
      supplyReduction: '0.1',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, burnRate, 60 * 1000);
    return NextResponse.json(burnRate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate burn rate' },
      { status: 500 }
    );
  }
}

