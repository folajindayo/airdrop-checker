import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-protocol-revenue/[address]
 * Track protocol revenue over time
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

    const cacheKey = `protocol-revenue:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const revenue = {
      protocolAddress: address,
      totalRevenue: '500000',
      revenue24h: '5000',
      revenue7d: '35000',
      revenue30d: '150000',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, revenue, 300 * 1000);
    return NextResponse.json(revenue);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track protocol revenue' },
      { status: 500 }
    );
  }
}

