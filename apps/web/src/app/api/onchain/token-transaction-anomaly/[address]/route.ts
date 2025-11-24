import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-anomaly/[address]
 * Detect anomalous transaction patterns and suspicious activity
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
    const cacheKey = `onchain-tx-anomaly:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const anomaly: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      anomalyScore: 0,
      detectedAnomalies: [],
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        const transactions = response.data.items;
        const avgValue = transactions.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.value_quote || '0'), 0) / transactions.length;
        
        const largeTxs = transactions.filter((tx: any) => 
          parseFloat(tx.value_quote || '0') > avgValue * 10);
        
        if (largeTxs.length > 0) {
          anomaly.detectedAnomalies.push('large_transaction_spike');
          anomaly.anomalyScore = Math.min(100, largeTxs.length * 20);
          anomaly.riskLevel = anomaly.anomalyScore > 50 ? 'high' : 'medium';
        }
      }
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }

    cache.set(cacheKey, anomaly, 2 * 60 * 1000);

    return NextResponse.json(anomaly);
  } catch (error) {
    console.error('Transaction anomaly error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect transaction anomalies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

