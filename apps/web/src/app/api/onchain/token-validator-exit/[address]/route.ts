import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-validator-exit/[address]
 * Track validator exit queue and withdrawal status
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
    const cacheKey = `onchain-validator-exit:${normalizedAddress}:${chainId || 'all'}`;
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
      exitStatus: 'active',
      exitQueuePosition: 0,
      withdrawalAvailable: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const exitTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('exit') ||
            event.decoded?.name?.toLowerCase().includes('withdraw')
          )
        );
        
        tracking.exitStatus = exitTxs.length > 0 ? 'exiting' : 'active';
        tracking.withdrawalAvailable = exitTxs.length > 0;
      }
    } catch (error) {
      console.error('Error tracking validator exit:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Validator exit tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track validator exit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






