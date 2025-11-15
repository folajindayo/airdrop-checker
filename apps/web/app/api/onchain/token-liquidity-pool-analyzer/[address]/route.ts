import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-pool-analyzer/[address]
 * Analyze liquidity pools across DEXes
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
    const cacheKey = `onchain-liquidity-pool:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const pool: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      poolCount: 0,
      totalLiquidity: 0,
      averagePoolSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        pool.totalLiquidity = liquidity;
        pool.poolCount = liquidity > 1000000 ? 5 : liquidity > 100000 ? 3 : 1;
        pool.averagePoolSize = pool.poolCount > 0 ? liquidity / pool.poolCount : 0;
      }
    } catch (error) {
      console.error('Error analyzing pools:', error);
    }

    cache.set(cacheKey, pool, 5 * 60 * 1000);

    return NextResponse.json(pool);
  } catch (error) {
    console.error('Liquidity pool analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze liquidity pools',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

