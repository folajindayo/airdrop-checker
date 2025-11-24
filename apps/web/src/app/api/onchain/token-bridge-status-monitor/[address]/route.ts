import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-status-monitor/[address]
 * Monitor bridge status and health metrics
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
    const cacheKey = `onchain-bridge-status:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const status: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      bridgeStatus: 'operational',
      healthScore: 100,
      lastActivity: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items && response.data.items.length > 0) {
        const latestTx = response.data.items[0];
        status.lastActivity = latestTx.block_signed_at;
        
        const successRate = response.data.items.filter((tx: any) => tx.successful).length / 
          response.data.items.length;
        status.healthScore = Math.round(successRate * 100);
        status.bridgeStatus = successRate > 0.95 ? 'operational' : 'degraded';
      }
    } catch (error) {
      console.error('Error monitoring bridge status:', error);
    }

    cache.set(cacheKey, status, 2 * 60 * 1000);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Bridge status monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor bridge status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






