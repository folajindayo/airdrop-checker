import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-router/[address]
 * Find optimal liquidity routing paths
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tokenOut = searchParams.get('tokenOut');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-liquidity-router:${normalizedAddress}:${tokenOut || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const router: any = {
      tokenIn: normalizedAddress,
      tokenOut: tokenOut || 'auto',
      chainId: targetChainId,
      routes: [],
      bestRoute: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        router.routes = [];
        router.bestRoute = {
          path: [normalizedAddress, tokenOut || 'WETH'],
          liquidity: parseFloat(response.data.total_liquidity_quote || '0'),
        };
      }
    } catch (error) {
      console.error('Error finding routes:', error);
    }

    cache.set(cacheKey, router, 2 * 60 * 1000);

    return NextResponse.json(router);
  } catch (error) {
    console.error('Liquidity router error:', error);
    return NextResponse.json(
      {
        error: 'Failed to find liquidity routes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





