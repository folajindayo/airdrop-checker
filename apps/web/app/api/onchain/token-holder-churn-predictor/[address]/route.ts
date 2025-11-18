import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-churn-predictor/[address]
 * Predict holder churn probability
 * Forecasts holder retention risks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-churn-predict:${normalizedAddress}:${chainId}`;
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
      churnProbability: 0,
      riskFactors: [],
      retentionScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const recentHolders = holders.filter((h: any) => {
          const lastTx = h.last_transaction_date;
          if (!lastTx) return false;
          const daysSince = (Date.now() - new Date(lastTx).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince < 30;
        });

        const churnRate = holders.length > 0 
          ? (holders.length - recentHolders.length) / holders.length 
          : 0;
        
        prediction.churnProbability = churnRate * 100;
        prediction.retentionScore = 100 - prediction.churnProbability;
        
        if (churnRate > 0.3) {
          prediction.riskFactors.push('high_inactivity');
        }
        if (holders.length < 100) {
          prediction.riskFactors.push('low_holder_count');
        }
      }
    } catch (error) {
      console.error('Error predicting churn:', error);
    }

    cache.set(cacheKey, prediction, 15 * 60 * 1000);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Churn prediction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to predict holder churn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

