import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-stability-monitor/[address]
 * Monitor liquidity stability over time
 * Tracks liquidity fluctuations
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
    const cacheKey = `onchain-liq-stability:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const stability: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      stabilityScore: 0,
      volatility: 0,
      trend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        const liquidities = pools.map((p: any) => 
          parseFloat(p.total_liquidity_quote || '0'));
        
        if (liquidities.length > 1) {
          const avgLiquidity = liquidities.reduce((a, b) => a + b, 0) / liquidities.length;
          const variance = liquidities.reduce((sum, l) => 
            sum + Math.pow(l - avgLiquidity, 2), 0) / liquidities.length;
          stability.volatility = Math.sqrt(variance) / avgLiquidity * 100;
          
          stability.stabilityScore = Math.max(0, 100 - stability.volatility * 2);
          
          const recent = liquidities.slice(-3).reduce((a, b) => a + b, 0) / 3;
          const earlier = liquidities.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          if (recent > earlier * 1.1) stability.trend = 'increasing';
          else if (recent < earlier * 0.9) stability.trend = 'decreasing';
        }
      }
    } catch (error) {
      console.error('Error monitoring stability:', error);
    }

    cache.set(cacheKey, stability, 10 * 60 * 1000);

    return NextResponse.json(stability);
  } catch (error) {
    console.error('Liquidity stability monitoring error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor liquidity stability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

