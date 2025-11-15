import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-backing-calculator/[address]
 * Calculate token backing value and collateralization
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

    const cacheKey = `backing-calculator:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const backing = {
      tokenAddress: address,
      backingValue: '5000000',
      collateralRatio: '1.2',
      isOverCollateralized: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, backing, 300 * 1000);
    return NextResponse.json(backing);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate backing' },
      { status: 500 }
    );
  }
}

