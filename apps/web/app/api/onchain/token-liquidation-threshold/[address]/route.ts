import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-threshold/[address]
 * Calculate liquidation threshold for positions
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

    const cacheKey = `liquidation-threshold:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const threshold = {
      tokenAddress: address,
      liquidationThreshold: '80',
      currentRatio: '150',
      liquidationPrice: '100',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, threshold, 60 * 1000);
    return NextResponse.json(threshold);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate liquidation threshold' },
      { status: 500 }
    );
  }
}

