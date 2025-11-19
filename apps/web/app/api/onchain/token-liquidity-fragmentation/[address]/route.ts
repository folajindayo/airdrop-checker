import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-fragmentation/[address]
 * Analyze liquidity fragmentation across DEX pools
 * Measures liquidity distribution efficiency
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
    const cacheKey = `onchain-liquidity-frag:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const fragmentation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      poolCount: 0,
      fragmentationIndex: 0,
      topPoolConcentration: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 50 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        fragmentation.poolCount = pools.length;
        
        if (pools.length > 0) {
          const totalLiquidity = pools.reduce((sum: number, p: any) => 
            sum + parseFloat(p.total_liquidity_quote || '0'), 0);
          
          const topPoolLiquidity = parseFloat(pools[0]?.total_liquidity_quote || '0');
          fragmentation.topPoolConcentration = totalLiquidity > 0 
            ? (topPoolLiquidity / totalLiquidity) * 100 
            : 0;
          
          fragmentation.fragmentationIndex = pools.length > 1 
            ? 100 - fragmentation.topPoolConcentration 
            : 0;
        }
      }
    } catch (error) {
      console.error('Error analyzing fragmentation:', error);
    }

    cache.set(cacheKey, fragmentation, 10 * 60 * 1000);

    return NextResponse.json(fragmentation);
  } catch (error) {
    console.error('Liquidity fragmentation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze liquidity fragmentation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

