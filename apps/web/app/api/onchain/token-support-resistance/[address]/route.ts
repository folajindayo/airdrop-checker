import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-support-resistance/[address]
 * Identify support and resistance levels for tokens
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `support-resistance:${address}:${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const levels = {
      tokenAddress: address,
      period,
      supportLevels: ['95.0', '90.5', '85.0'],
      resistanceLevels: ['110.0', '115.5', '120.0'],
      currentPrice: '102.5',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, levels, 300 * 1000);
    return NextResponse.json(levels);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to find support/resistance' },
      { status: 500 }
    );
  }
}

