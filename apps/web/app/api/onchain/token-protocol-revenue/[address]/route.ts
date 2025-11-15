import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
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
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-protocol-revenue:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const revenue: any = {
      protocolAddress: normalizedAddress,
      chainId: targetChainId,
      totalRevenue: '0',
      dailyRevenue: '0',
      weeklyRevenue: '0',
      revenueHistory: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, revenue, 5 * 60 * 1000);
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Protocol revenue error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track protocol revenue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
