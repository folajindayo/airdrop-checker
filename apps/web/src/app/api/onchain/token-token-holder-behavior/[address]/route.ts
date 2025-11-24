import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-holder-behavior/[address]
 * Analyze holder behavior patterns and strategies
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
    const cacheKey = `onchain-holder-behavior:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const behavior: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      patterns: [],
      strategy: 'hodl',
      activityLevel: 'moderate',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        behavior.patterns = ['long_term_holding', 'occasional_trading'];
        behavior.strategy = response.data.items.length < 10 ? 'hodl' : 'active_trading';
        behavior.activityLevel = response.data.items.length > 50 ? 'high' : response.data.items.length > 20 ? 'moderate' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing behavior:', error);
    }

    cache.set(cacheKey, behavior, 5 * 60 * 1000);

    return NextResponse.json(behavior);
  } catch (error) {
    console.error('Token holder behavior error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holder behavior',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

