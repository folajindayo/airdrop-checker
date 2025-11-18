import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-retention-forecast/[address]
 * Forecast holder retention rates
 * Predicts future holder behavior
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
    const cacheKey = `onchain-retention-forecast:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const forecast: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      retentionForecast: 0,
      churnRisk: 0,
      predictedRetention: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const now = Date.now();
        const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        const activeHolders = holders.filter((h: any) => {
          const lastTx = h.last_transaction_date;
          if (!lastTx) return false;
          return new Date(lastTx).getTime() > monthAgo;
        });
        
        const retentionRate = holders.length > 0 
          ? (activeHolders.length / holders.length) * 100 
          : 0;
        
        forecast.retentionForecast = retentionRate;
        forecast.churnRisk = 100 - retentionRate;
        forecast.predictedRetention = retentionRate * 0.9;
      }
    } catch (error) {
      console.error('Error forecasting retention:', error);
    }

    cache.set(cacheKey, forecast, 15 * 60 * 1000);

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Retention forecast error:', error);
    return NextResponse.json(
      {
        error: 'Failed to forecast retention',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

