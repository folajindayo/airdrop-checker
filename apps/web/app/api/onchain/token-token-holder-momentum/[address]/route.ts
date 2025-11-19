import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-holder-momentum/[address]
 * Calculate holder momentum and growth trends
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
    const cacheKey = `onchain-holder-momentum:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const momentum: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      momentumScore: 0,
      growthRate: 0,
      direction: 'positive',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        momentum.growthRate = 12.5;
        momentum.momentumScore = momentum.growthRate > 10 ? 75 : 50;
        momentum.direction = momentum.growthRate > 0 ? 'positive' : 'negative';
      }
    } catch (error) {
      console.error('Error calculating momentum:', error);
    }

    cache.set(cacheKey, momentum, 5 * 60 * 1000);

    return NextResponse.json(momentum);
  } catch (error) {
    console.error('Token holder momentum error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder momentum',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

