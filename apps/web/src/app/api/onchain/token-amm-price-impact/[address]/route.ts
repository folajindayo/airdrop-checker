import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-amm-price-impact/[address]
 * Calculate AMM price impact for swaps
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const swapAmount = searchParams.get('swapAmount');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const amount = swapAmount ? parseFloat(swapAmount) : 10000;
    const cacheKey = `onchain-amm-impact:${normalizedAddress}:${amount}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const impact: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      swapAmount: amount,
      priceImpact: 0,
      executionPrice: 0,
      optimalAmount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        impact.priceImpact = liquidity > 0 ? (amount / liquidity) * 100 : 5;
        impact.executionPrice = parseFloat(response.data.prices?.[0]?.price || '0') * (1 + impact.priceImpact / 100);
        impact.optimalAmount = liquidity * 0.01;
      }
    } catch (error) {
      console.error('Error calculating AMM impact:', error);
    }

    cache.set(cacheKey, impact, 2 * 60 * 1000);

    return NextResponse.json(impact);
  } catch (error) {
    console.error('AMM price impact error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate AMM price impact',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

