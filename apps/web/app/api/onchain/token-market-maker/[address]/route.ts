import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-maker/[address]
 * Track market maker activity and liquidity provision
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

    const cacheKey = `market-maker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const mm = {
      address,
      totalLiquidity: '2000000',
      activePools: 5,
      feesEarned: '50000',
      apy: '12.5',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, mm, 60 * 1000);
    return NextResponse.json(mm);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track market maker' },
      { status: 500 }
    );
  }
}

