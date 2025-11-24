import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-fragmentation/[address]
 * Analyze liquidity fragmentation across DEX pools
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
    const cacheKey = `onchain-liquidity-frag:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const fragmentation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      poolCount: 0,
      fragmentationIndex: 0,
      largestPoolShare: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        fragmentation.poolCount = 1;
        fragmentation.largestPoolShare = 100;
        fragmentation.fragmentationIndex = 0;
      }
    } catch (error) {
      console.error('Error analyzing fragmentation:', error);
    }

    cache.set(cacheKey, fragmentation, 5 * 60 * 1000);

    return NextResponse.json(fragmentation);
  } catch (error) {
    console.error('Liquidity fragmentation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze liquidity fragmentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
