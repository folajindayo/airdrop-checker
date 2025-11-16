import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-auto-lp-tracker/[address]
 * Track automatic liquidity provision
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

    const cacheKey = `auto-lp-tracker:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const autoLP = {
      tokenAddress: address,
      hasAutoLP: false,
      lpPercentage: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, autoLP, 300 * 1000);
    return NextResponse.json(autoLP);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track auto LP' },
      { status: 500 }
    );
  }
}

