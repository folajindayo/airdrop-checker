import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-distribution-score/[address]
 * Calculate distribution score for token
 * Measures how well tokens are distributed
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
    const cacheKey = `onchain-distribution-score:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const score: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      distributionScore: 0,
      holderCount: 0,
      scoreCategory: 'poor',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 1 }
      );

      if (response.data?.pagination) {
        score.holderCount = response.data.pagination.total_count || 0;
        score.distributionScore = score.holderCount > 10000 ? 100 :
                                 score.holderCount > 5000 ? 80 :
                                 score.holderCount > 1000 ? 60 :
                                 score.holderCount > 100 ? 40 : 20;
        score.scoreCategory = score.distributionScore > 80 ? 'excellent' :
                             score.distributionScore > 60 ? 'good' :
                             score.distributionScore > 40 ? 'fair' : 'poor';
      }
    } catch (error) {
      console.error('Error calculating score:', error);
    }

    cache.set(cacheKey, score, 5 * 60 * 1000);

    return NextResponse.json(score);
  } catch (error) {
    console.error('Distribution score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate distribution score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

