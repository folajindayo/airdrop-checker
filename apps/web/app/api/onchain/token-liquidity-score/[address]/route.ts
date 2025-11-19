import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-score/[address]
 * Calculate comprehensive liquidity score
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
    const cacheKey = `onchain-liquidity-score:${normalizedAddress}:${chainId || 'all'}`;
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
      liquidityScore: 0,
      depthScore: 0,
      volumeScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        score.depthScore = Math.min((liquidity / 1000000) * 100, 100);
        score.volumeScore = Math.min((volume / 100000) * 100, 100);
        score.liquidityScore = (score.depthScore + score.volumeScore) / 2;
      }
    } catch (error) {
      console.error('Error calculating score:', error);
    }

    cache.set(cacheKey, score, 5 * 60 * 1000);

    return NextResponse.json(score);
  } catch (error) {
    console.error('Liquidity score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidity score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





