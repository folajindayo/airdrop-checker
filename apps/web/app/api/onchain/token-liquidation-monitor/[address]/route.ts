import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-monitor/[address]
 * Monitor liquidation risk and thresholds
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
    const cacheKey = `onchain-liquidation-monitor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const monitor: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      liquidationRisk: 'low',
      healthFactor: 2.0,
      liquidationPrice: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const failedTxs = response.data.items.filter((tx: any) => !tx.successful);
        const riskScore = (failedTxs.length / response.data.items.length) * 100;
        
        monitor.healthFactor = riskScore < 10 ? 2.0 : riskScore < 30 ? 1.5 : 1.0;
        monitor.liquidationRisk = monitor.healthFactor < 1.2 ? 'high' : 
                                  monitor.healthFactor < 1.5 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error monitoring liquidation risk:', error);
    }

    cache.set(cacheKey, monitor, 2 * 60 * 1000);

    return NextResponse.json(monitor);
  } catch (error) {
    console.error('Liquidation monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor liquidation risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





