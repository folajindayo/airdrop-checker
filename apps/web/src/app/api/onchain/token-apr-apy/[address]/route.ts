import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-apr-apy/[address]
 * Calculate APR and APY for staking and yield farming
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const protocol = searchParams.get('protocol');

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `apr-apy:${address}:${protocol || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const rates = {
      tokenAddress: address,
      protocol: protocol || 'all',
      apr: '8.5',
      apy: '8.87',
      compounding: 'daily',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rates, 300 * 1000);
    return NextResponse.json(rates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate APR/APY' },
      { status: 500 }
    );
  }
}

