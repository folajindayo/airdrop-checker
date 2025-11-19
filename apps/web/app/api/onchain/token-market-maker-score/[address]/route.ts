import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-maker-score/[address]
 * Calculate market maker quality and activity score
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
    const cacheKey = `onchain-mm-score:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const mmScore: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      liquidityProvided: 0,
      activityFrequency: 0,
      marketMakerScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        mmScore.liquidityProvided = parseFloat(response.data.total_liquidity_quote || '0');
        mmScore.marketMakerScore = Math.min(100, (mmScore.liquidityProvided / 1000000) * 10);
      }
    } catch (error) {
      console.error('Error calculating MM score:', error);
    }

    cache.set(cacheKey, mmScore, 3 * 60 * 1000);

    return NextResponse.json(mmScore);
  } catch (error) {
    console.error('Market maker score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market maker score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
