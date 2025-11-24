import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-anomaly-detector/[address]
 * Detect price anomalies and manipulation
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
    const cacheKey = `onchain-price-anomaly:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const anomaly: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      anomalyScore: 0,
      hasAnomaly: false,
      anomalyType: null,
      priceChange24h: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const priceChange = Math.abs(parseFloat(response.data.price_change_24h || '0'));
        anomaly.priceChange24h = parseFloat(response.data.price_change_24h || '0');
        anomaly.anomalyScore = priceChange > 50 ? 100 : priceChange > 30 ? 70 : priceChange > 20 ? 50 : 0;
        anomaly.hasAnomaly = priceChange > 30;
        anomaly.anomalyType = priceChange > 50 ? 'extreme_volatility' :
                             priceChange > 30 ? 'high_volatility' : null;
      }
    } catch (error) {
      console.error('Error detecting anomaly:', error);
    }

    cache.set(cacheKey, anomaly, 2 * 60 * 1000);

    return NextResponse.json(anomaly);
  } catch (error) {
    console.error('Price anomaly detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect price anomalies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






