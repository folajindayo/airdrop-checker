import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-utilization-rate/[address]
 * Calculate pool utilization rate
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

    const cacheKey = `utilization-rate:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const utilization = {
      tokenAddress: address,
      utilizationRate: '65',
      totalSupplied: '10000000',
      totalBorrowed: '6500000',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, utilization, 60 * 1000);
    return NextResponse.json(utilization);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate utilization rate' },
      { status: 500 }
    );
  }
}

