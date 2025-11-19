import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-depth-analyzer/[address]
 * Analyze market depth at different price levels
 * Measures order book depth
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
    const cacheKey = `onchain-market-depth:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const depth: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      depthScore: 0,
      liquidityLayers: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        
        depth.depthScore = Math.min((totalLiquidity / 1000000) * 100, 100);
        
        depth.liquidityLayers = pools.slice(0, 5).map((p: any, index: number) => ({
          layer: index + 1,
          liquidity: parseFloat(p.total_liquidity_quote || '0'),
          poolAddress: p.address,
        }));
      }
    } catch (error) {
      console.error('Error analyzing depth:', error);
    }

    cache.set(cacheKey, depth, 5 * 60 * 1000);

    return NextResponse.json(depth);
  } catch (error) {
    console.error('Market depth analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze market depth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

