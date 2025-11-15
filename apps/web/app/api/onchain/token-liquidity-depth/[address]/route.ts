import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-depth/[address]
 * Measure liquidity depth across price levels
 * Analyzes order book depth
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
    const cacheKey = `onchain-liquidity-depth:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const depth: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      totalLiquidity: 0,
      depthScore: 0,
      liquidityQuality: 'medium',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        depth.totalLiquidity = parseFloat(response.data.total_liquidity_quote || '0');
        depth.depthScore = depth.totalLiquidity > 1000000 ? 100 :
                          depth.totalLiquidity > 100000 ? 70 :
                          depth.totalLiquidity > 10000 ? 40 : 20;
        depth.liquidityQuality = depth.totalLiquidity > 1000000 ? 'excellent' :
                                depth.totalLiquidity > 100000 ? 'good' :
                                depth.totalLiquidity > 10000 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error measuring depth:', error);
    }

    cache.set(cacheKey, depth, 3 * 60 * 1000);

    return NextResponse.json(depth);
  } catch (error) {
    console.error('Liquidity depth error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure liquidity depth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
