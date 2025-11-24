import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-slippage-predictor/[address]
 * Predict slippage for token trades based on liquidity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const tradeSize = searchParams.get('tradeSize');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-slippage-predict:${normalizedAddress}:${tradeSize || 'default'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const size = tradeSize ? parseFloat(tradeSize) : 1000;

    const prediction: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      tradeSize: size,
      estimatedSlippage: 0,
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        prediction.estimatedSlippage = liquidity > 0 ? 
          Math.min(5, (size / liquidity) * 100) : 5;
        prediction.confidence = liquidity > size * 10 ? 90 : 60;
      }
    } catch (error) {
      console.error('Error predicting slippage:', error);
    }

    cache.set(cacheKey, prediction, 1 * 60 * 1000);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Slippage predictor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict slippage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
