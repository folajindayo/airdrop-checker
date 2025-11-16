import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-reserve-tracker/[address]
 * Track token reserves and backing assets
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
    const cacheKey = `onchain-reserve:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const reserve: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      reserveBalance: '0',
      backingAssets: [],
      backingRatio: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        reserve.reserveBalance = response.data.total_supply || '0';
      }
    } catch (error) {
      console.error('Error tracking reserves:', error);
    }

    cache.set(cacheKey, reserve, 5 * 60 * 1000);
    return NextResponse.json(reserve);
  } catch (error) {
    console.error('Reserve tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track reserves',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
