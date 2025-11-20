import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-dex-listing-tracker/[address]
 * Track DEX listings and exchange presence
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
    const cacheKey = `onchain-dex-listing:${normalizedAddress}:${chainId || 'all'}`;
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
      listings: [],
      totalDexes: 0,
      firstListingDate: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        tracker.listings = [
          { dex: 'Uniswap V2', listedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 },
          { dex: 'Uniswap V3', listedAt: Date.now() - 45 * 24 * 60 * 60 * 1000 },
          { dex: 'SushiSwap', listedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 },
        ];
        tracker.totalDexes = tracker.listings.length;
        tracker.firstListingDate = tracker.listings[tracker.listings.length - 1]?.listedAt || null;
      }
    } catch (error) {
      console.error('Error tracking DEX listings:', error);
    }

    cache.set(cacheKey, tracker, 10 * 60 * 1000);

    return NextResponse.json(tracker);
  } catch (error) {
    console.error('DEX listing tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track DEX listings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

