import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-maker-activity-detector/[address]
 * Detect market maker activity patterns
 * Identifies MM behavior and strategies
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
    const cacheKey = `onchain-mm-activity:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const mmActivity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      mmProbability: 0,
      activityPattern: 'unknown',
      liquidityProvision: 0,
      timestamp: Date.now(),
    };

    try {
      const poolsResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (poolsResponse.data?.items) {
        const pools = poolsResponse.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        
        mmActivity.liquidityProvision = totalLiquidity;
        
        if (pools.length > 1 && totalLiquidity > 100000) {
          mmActivity.mmProbability = Math.min((totalLiquidity / 1000000) * 100, 100);
          mmActivity.activityPattern = 'liquidity_provider';
        } else if (pools.length === 1 && totalLiquidity > 50000) {
          mmActivity.mmProbability = 50;
          mmActivity.activityPattern = 'single_pool_focused';
        }
      }
    } catch (error) {
      console.error('Error detecting MM activity:', error);
    }

    cache.set(cacheKey, mmActivity, 10 * 60 * 1000);

    return NextResponse.json(mmActivity);
  } catch (error) {
    console.error('MM activity detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect market maker activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



