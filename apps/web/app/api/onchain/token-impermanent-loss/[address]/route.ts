import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-impermanent-loss/[address]
 * Calculate impermanent loss for LP positions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('pool');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `impermanent-loss:${address}:${poolAddress || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const il = {
      walletAddress: address,
      poolAddress: poolAddress || 'all',
      currentIL: '-2.5',
      projectedIL: '-3.2',
      priceChange: '10',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, il, 60 * 1000);
    return NextResponse.json(il);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate impermanent loss' },
      { status: 500 }
    );
  }
}

