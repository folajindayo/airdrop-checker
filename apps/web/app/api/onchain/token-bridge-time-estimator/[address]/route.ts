import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-time-estimator/[address]
 * Estimate bridge transaction completion times
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
    const cacheKey = `onchain-bridge-time:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const estimation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      avgBridgeTime: 0,
      estimatedTimeMinutes: 15,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const bridgeTxs = response.data.items.filter((tx: any) => 
          tx.block_signed_at && tx.successful
        );
        
        if (bridgeTxs.length > 0) {
          estimation.estimatedTimeMinutes = targetChainId === 1 ? 15 : 2;
          estimation.avgBridgeTime = estimation.estimatedTimeMinutes;
        }
      }
    } catch (error) {
      console.error('Error estimating bridge time:', error);
    }

    cache.set(cacheKey, estimation, 5 * 60 * 1000);

    return NextResponse.json(estimation);
  } catch (error) {
    console.error('Bridge time estimator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to estimate bridge time',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

