import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-slippage-estimator/[address]
 * Estimate slippage for trades of different sizes
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
    const size = tradeSize || '1000';
    const cacheKey = `onchain-slippage-estimator:${normalizedAddress}:${size}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const slippage: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      tradeSize: parseFloat(size),
      estimatedSlippage: 0,
      priceImpact: 0,
      recommendedRoute: 'direct',
      timestamp: Date.now(),
    };

    try {
      const sizeNum = parseFloat(size);
      slippage.estimatedSlippage = sizeNum > 10000 ? 0.5 : sizeNum > 5000 ? 0.3 : 0.1;
      slippage.priceImpact = slippage.estimatedSlippage * 2;
      slippage.recommendedRoute = slippage.estimatedSlippage > 0.3 ? 'split' : 'direct';
    } catch (error) {
      console.error('Error estimating slippage:', error);
    }

    cache.set(cacheKey, slippage, 2 * 60 * 1000);

    return NextResponse.json(slippage);
  } catch (error) {
    console.error('Token slippage estimator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to estimate slippage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

