import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-timelock-queue/[address]
 * Track timelock queue and execution delays
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
    const cacheKey = `onchain-timelock-queue:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      queuedTransactions: [],
      delay: 86400,
      executionTime: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const timelockTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('queue') ||
            event.decoded?.name?.toLowerCase().includes('timelock')
          )
        );
        
        tracking.queuedTransactions = timelockTxs.map((tx: any) => ({
          hash: tx.tx_hash,
          queuedAt: tx.block_signed_at,
          executeAfter: new Date(new Date(tx.block_signed_at).getTime() + tracking.delay * 1000).toISOString(),
        }));
      }
    } catch (error) {
      console.error('Error tracking timelock queue:', error);
    }

    cache.set(cacheKey, tracking, 2 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Timelock queue tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track timelock queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






