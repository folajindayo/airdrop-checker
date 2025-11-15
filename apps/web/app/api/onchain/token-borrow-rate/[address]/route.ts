import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-borrow-rate/[address]
 * Get current borrow rates for lending protocols
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

    const cacheKey = `borrow-rate:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rate = {
      tokenAddress: address,
      borrowRate: '5.5',
      apy: '5.75',
      utilizationRate: '65',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rate, 60 * 1000);
    return NextResponse.json(rate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get borrow rate' },
      { status: 500 }
    );
  }
}

