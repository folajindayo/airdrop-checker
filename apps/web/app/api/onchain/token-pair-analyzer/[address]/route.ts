import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-pair-analyzer/[address]
 * Analyze token trading pairs across DEXs
 * Identifies available pairs and liquidity
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
    const cacheKey = `onchain-pair-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const pairs: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      tradingPairs: [] as any[],
      totalPairs: 0,
      totalLiquidity: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.pools) {
        response.data.pools.forEach((pool: any) => {
          pairs.tradingPairs.push({
            pairAddress: pool.exchange,
            token0: pool.token_0?.contract_address,
            token1: pool.token_1?.contract_address,
            liquidity: parseFloat(pool.liquidity_quote || '0'),
            dex: pool.exchange,
          });
          pairs.totalLiquidity += parseFloat(pool.liquidity_quote || '0');
        });

        pairs.totalPairs = pairs.tradingPairs.length;
      }
    } catch (error) {
      console.error('Error analyzing pairs:', error);
    }

    cache.set(cacheKey, pairs, 3 * 60 * 1000);

    return NextResponse.json(pairs);
  } catch (error) {
    console.error('Token pair analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading pairs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

