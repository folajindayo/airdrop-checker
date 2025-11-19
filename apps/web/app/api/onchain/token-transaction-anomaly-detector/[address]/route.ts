import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-anomaly-detector/[address]
 * Detect anomalous transaction patterns for token
 * Identifies suspicious activity and manipulation
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
    const cacheKey = `onchain-tx-anomaly:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const anomaly: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      anomalyScore: 0,
      suspiciousPatterns: [],
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const volumes = transactions.map((tx: any) => 
          parseFloat(tx.value_quote || '0'));
        
        const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
        const maxVolume = Math.max(...volumes);
        
        if (maxVolume > avgVolume * 10) {
          anomaly.suspiciousPatterns.push('volume_spike');
          anomaly.anomalyScore += 30;
        }
        
        if (volumes.length > 0 && volumes[volumes.length - 1] > avgVolume * 5) {
          anomaly.suspiciousPatterns.push('recent_spike');
          anomaly.anomalyScore += 20;
        }
      }
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }

    if (anomaly.anomalyScore > 70) anomaly.riskLevel = 'high';
    else if (anomaly.anomalyScore > 40) anomaly.riskLevel = 'medium';

    cache.set(cacheKey, anomaly, 5 * 60 * 1000);

    return NextResponse.json(anomaly);
  } catch (error) {
    console.error('Transaction anomaly detection error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect transaction anomalies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


