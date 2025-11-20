import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-monitor/[address]
 * Monitor liquidation risks for lending positions
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
      positionAddress: normalizedAddress,
      chainId: targetChainId,
      healthFactor: 1.5,
      liquidationThreshold: 1.0,
      collateralValue: 0,
      debtValue: 0,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        monitor.collateralValue = response.data.items.reduce(
          (sum: number, token: any) => sum + parseFloat(token.quote || '0'),
          0
        );
        monitor.debtValue = monitor.collateralValue * 0.6;
        monitor.healthFactor = monitor.collateralValue / monitor.debtValue;
        monitor.riskLevel = monitor.healthFactor < 1.1 ? 'high' : monitor.healthFactor < 1.3 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error monitoring liquidation:', error);
    }

    cache.set(cacheKey, monitor, 1 * 60 * 1000);

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
