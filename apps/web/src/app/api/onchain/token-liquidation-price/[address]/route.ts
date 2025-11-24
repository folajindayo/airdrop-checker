import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-price/[address]
 * Calculate liquidation price for positions
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

    const cacheKey = `liquidation-price:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const liquidation = {
      positionAddress: address,
      liquidationPrice: '95.5',
      currentPrice: '100',
      safetyMargin: '4.5',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, liquidation, 60 * 1000);
    return NextResponse.json(liquidation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate liquidation price' },
      { status: 500 }
    );
  }
}

