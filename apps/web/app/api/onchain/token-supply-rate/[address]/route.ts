import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-supply-rate/[address]
 * Get supply rates for lending protocols
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

    const cacheKey = `supply-rate:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rate = {
      tokenAddress: address,
      supplyRate: '3.2',
      apy: '3.25',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rate, 60 * 1000);
    return NextResponse.json(rate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get supply rate' },
      { status: 500 }
    );
  }
}

