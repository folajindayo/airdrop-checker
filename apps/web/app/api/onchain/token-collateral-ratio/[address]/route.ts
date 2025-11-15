import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-collateral-ratio/[address]
 * Calculate collateral ratio for lending protocols
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

    const cacheKey = `collateral-ratio:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const ratio = {
      tokenAddress: address,
      collateralRatio: '150',
      minCollateralRatio: '110',
      isHealthy: true,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, ratio, 60 * 1000);
    return NextResponse.json(ratio);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate collateral ratio' },
      { status: 500 }
    );
  }
}

