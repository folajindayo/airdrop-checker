import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-quality-score/[address]
 * Calculate comprehensive liquidity quality score
 * Measures liquidity health and stability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-liq-quality:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const quality: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      qualityScore: 0,
      depthScore: 0,
      stabilityScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        
        quality.depthScore = Math.min((totalLiquidity / 1000000) * 50, 50);
        quality.stabilityScore = pools.length > 1 ? 30 : 20;
        quality.qualityScore = quality.depthScore + quality.stabilityScore;
      }
    } catch (error) {
      console.error('Error calculating quality:', error);
    }

    cache.set(cacheKey, quality, 10 * 60 * 1000);

    return NextResponse.json(quality);
  } catch (error) {
    console.error('Liquidity quality score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidity quality score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

