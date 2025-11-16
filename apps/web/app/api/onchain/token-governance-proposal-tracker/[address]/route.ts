import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-governance-proposal-tracker/[address]
 * Track governance proposals and voting activity
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
    const cacheKey = `onchain-gov-proposal:${normalizedAddress}:${chainId || 'all'}`;
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
      proposals: [],
      votesCast: 0,
      participationRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const voteTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('vote') ||
            event.decoded?.name?.toLowerCase().includes('proposal')
          )
        );
        
        tracking.votesCast = voteTxs.length;
        tracking.participationRate = voteTxs.length > 0 ? 
          (voteTxs.length / response.data.items.length) * 100 : 0;
      }
    } catch (error) {
      console.error('Error tracking governance proposals:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Governance proposal tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track governance proposals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

