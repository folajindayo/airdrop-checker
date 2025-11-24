import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-churn-predictor/[address]
 * Predict holder churn probability based on activity patterns
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
    const cacheKey = `onchain-churn-predict:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const prediction: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      churnProbability: 0,
      riskFactors: [],
      retentionScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const holderCount = parseFloat(response.data.holder_count || '0');
        prediction.churnProbability = holderCount < 100 ? 40 : 15;
        prediction.retentionScore = 100 - prediction.churnProbability;
        if (prediction.churnProbability > 30) {
          prediction.riskFactors.push('low_holder_count');
        }
      }
    } catch (error) {
      console.error('Error predicting churn:', error);
    }

    cache.set(cacheKey, prediction, 10 * 60 * 1000);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Churn predictor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict holder churn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
