import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-stability/[address]
 * Measure liquidity stability over time
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
    const cacheKey = `onchain-liquidity-stability:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const stability: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      stabilityScore: 0,
      liquidityVolatility: 0,
      stabilityLevel: 'medium',
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
        const liquidityVolatility = liquidity > 0 ? (volume / liquidity) * 100 : 50;
        stability.liquidityVolatility = liquidityVolatility;
        stability.stabilityScore = Math.max(0, 100 - liquidityVolatility);
        stability.stabilityLevel = stability.stabilityScore > 75 ? 'high' :
                                   stability.stabilityScore > 50 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error measuring stability:', error);
    }

    cache.set(cacheKey, stability, 5 * 60 * 1000);

    return NextResponse.json(stability);
  } catch (error) {
    console.error('Liquidity stability error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure liquidity stability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





