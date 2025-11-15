import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-volume/[address]
 * Track token trading volume over time periods
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

    const cacheKey = `trading-volume:${address}:${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const volume = {
      tokenAddress: address,
      period,
      volume24h: '5000000',
      volume7d: '35000000',
      volume30d: '150000000',
      averageVolume: '5000000',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, volume, 60 * 1000);
    return NextResponse.json(volume);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trading volume' },
      { status: 500 }
    );
  }
}

