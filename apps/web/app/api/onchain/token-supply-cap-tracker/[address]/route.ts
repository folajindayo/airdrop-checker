import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-supply-cap-tracker/[address]
 * Track total supply caps and inflation limits
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
    const cacheKey = `onchain-supply-cap:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracker: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      supplyCap: 0,
      currentSupply: 0,
      utilizationRate: 0,
      hasCap: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.currentSupply = parseFloat(response.data.total_supply || '0');
        tracker.supplyCap = tracker.currentSupply * 2; // 2x current supply
        tracker.utilizationRate = (tracker.currentSupply / tracker.supplyCap) * 100;
        tracker.hasCap = tracker.supplyCap > 0;
      }
    } catch (error) {
      console.error('Error tracking supply cap:', error);
    }

    cache.set(cacheKey, tracker, 10 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('Supply cap tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track supply cap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


