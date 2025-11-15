import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-analyzer/[address]
 * Analyze token liquidity across DEX pools
 * Provides comprehensive liquidity metrics
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
    const cacheKey = `onchain-liquidity-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const targetChain = SUPPORTED_CHAINS.find(c => c.id === targetChainId) || SUPPORTED_CHAINS[0];

    const analysis: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      chainName: targetChain.name,
      liquidityPools: [] as any[],
      totalLiquidityUSD: 0,
      liquidityDistribution: {} as Record<string, number>,
      insights: [] as string[],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const token = response.data;
        analysis.totalLiquidityUSD = parseFloat(token.total_liquidity_quote || '0');
        
        if (token.pools && Array.isArray(token.pools)) {
          token.pools.forEach((pool: any) => {
            const poolLiquidity = parseFloat(pool.liquidity_quote || '0');
            analysis.liquidityPools.push({
              poolAddress: pool.exchange,
              dexName: pool.exchange,
              liquidityUSD: poolLiquidity,
              token0: pool.token_0?.contract_address,
              token1: pool.token_1?.contract_address,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing liquidity:', error);
    }

    analysis.insights = generateLiquidityInsights(analysis);

    cache.set(cacheKey, analysis, 3 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Token liquidity analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token liquidity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateLiquidityInsights(analysis: any): string[] {
  const insights: string[] = [];

  if (analysis.totalLiquidityUSD > 1000000) {
    insights.push('High liquidity token with strong market depth');
  } else if (analysis.totalLiquidityUSD < 100000) {
    insights.push('Low liquidity - potential slippage risk');
  }

  if (analysis.liquidityPools.length > 5) {
    insights.push('Well distributed across multiple DEX pools');
  }

  return insights;
}

