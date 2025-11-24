import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-reward-distribution/[address]
 * Track reward distribution mechanisms
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

    const cacheKey = `reward-distribution:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const distribution = {
      tokenAddress: address,
      totalRewards: '0',
      distributionRate: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, distribution, 60 * 1000);
    return NextResponse.json(distribution);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track reward distribution' },
      { status: 500 }
    );
  }
}

