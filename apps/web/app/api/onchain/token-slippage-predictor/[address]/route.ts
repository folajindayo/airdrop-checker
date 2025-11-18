import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-slippage-predictor/[address]
 * Predict slippage for token swaps
 * Estimates price impact for different trade sizes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';
    const tradeSize = parseFloat(searchParams.get('tradeSize') || '1000');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-slippage-predict:${normalizedAddress}:${chainId}:${tradeSize}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const prediction: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      tradeSize,
      expectedSlippage: 0,
      priceImpact: 0,
      recommendedMaxSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data?.items && response.data.items.length > 0) {
        const topPool = response.data.items[0];
        const poolLiquidity = parseFloat(topPool.total_liquidity_quote || '0');
        
        if (poolLiquidity > 0) {
          const liquidityRatio = tradeSize / poolLiquidity;
          prediction.priceImpact = liquidityRatio * 100;
          prediction.expectedSlippage = Math.min(prediction.priceImpact * 1.2, 50);
          
          prediction.recommendedMaxSize = poolLiquidity * 0.01;
        }
      }
    } catch (error) {
      console.error('Error predicting slippage:', error);
    }

    cache.set(cacheKey, prediction, 2 * 60 * 1000);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Slippage prediction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict slippage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

