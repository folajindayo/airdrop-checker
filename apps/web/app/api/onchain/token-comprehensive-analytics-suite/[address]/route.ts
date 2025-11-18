import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-comprehensive-analytics-suite/[address]
 * Comprehensive analytics combining all metrics
 * Complete token analysis dashboard
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
    const cacheKey = `onchain-comprehensive:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const analytics: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      overallScore: 0,
      metrics: {
        liquidity: 0,
        holder: 0,
        trading: 0,
        market: 0,
      },
      timestamp: Date.now(),
    };

    try {
      const tokenResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      const holdersResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      const poolsResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (tokenResponse.data?.items?.[0]) {
        const token = tokenResponse.data.items[0];
        const marketCap = parseFloat(token.market_cap_quote || '0');
        const volume24h = parseFloat(token.volume_24h_quote || '0');
        
        analytics.metrics.market = marketCap > 0 
          ? Math.min((volume24h / marketCap) * 100, 100) 
          : 0;
      }

      if (poolsResponse.data?.items) {
        const pools = poolsResponse.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        analytics.metrics.liquidity = Math.min((totalLiquidity / 1000000) * 100, 100);
      }

      if (holdersResponse.data?.items) {
        const holders = holdersResponse.data.items;
        analytics.metrics.holder = Math.min((holders.length / 1000) * 100, 100);
      }

      analytics.overallScore = (
        analytics.metrics.liquidity * 0.3 +
        analytics.metrics.holder * 0.3 +
        analytics.metrics.trading * 0.2 +
        analytics.metrics.market * 0.2
      );
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }

    cache.set(cacheKey, analytics, 10 * 60 * 1000);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate comprehensive analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

