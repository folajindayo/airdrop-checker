import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-impact-calculator/[address]
 * Calculate price impact for different trade sizes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tradeSize = searchParams.get('tradeSize') || '1000';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const tradeAmount = parseFloat(tradeSize);
    const cacheKey = `onchain-price-impact-calc:${normalizedAddress}:${chainId || 'all'}:${tradeAmount}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const impact: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      tradeSize: tradeAmount,
      priceImpact: 0,
      slippage: 0,
      recommendedMaxSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        if (liquidity > 0) {
          impact.priceImpact = (tradeAmount / liquidity) * 100;
          impact.slippage = impact.priceImpact * 0.5;
          impact.recommendedMaxSize = liquidity * 0.05;
        }
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
    }

    cache.set(cacheKey, impact, 2 * 60 * 1000);

    return NextResponse.json(impact);
  } catch (error) {
    console.error('Price impact calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate price impact',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
