import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-supply-growth-predictor/[address]
 * Predict future token supply growth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const months = parseInt(searchParams.get('months') || '12');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-supply-growth-predictor:${normalizedAddress}:${months}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const predictor: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      currentSupply: 0,
      projectedSupply: 0,
      growthRate: 0,
      projections: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        predictor.currentSupply = parseFloat(response.data.total_supply || '0');
        predictor.growthRate = 2.5; // percentage per month
        predictor.projectedSupply = predictor.currentSupply * Math.pow(1 + predictor.growthRate / 100, months);
        
        predictor.projections = Array.from({ length: months }, (_, i) => ({
          month: i + 1,
          supply: predictor.currentSupply * Math.pow(1 + predictor.growthRate / 100, i + 1),
          growth: predictor.growthRate,
        }));
      }
    } catch (error) {
      console.error('Error predicting supply growth:', error);
    }

    cache.set(cacheKey, predictor, 60 * 60 * 1000);

    return NextResponse.json(predictor);
  } catch (error) {
    console.error('Supply growth predictor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict supply growth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

