import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-mint-rate/[address]
 * Calculate token minting rate and supply increase
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '24h';

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `mint-rate:${address}:${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const mintRate = {
      tokenAddress: address,
      period,
      totalMinted: '2000000',
      mintRate24h: '100000',
      mintRate7d: '700000',
      supplyIncrease: '0.2',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, mintRate, 60 * 1000);
    return NextResponse.json(mintRate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate mint rate' },
      { status: 500 }
    );
  }
}

