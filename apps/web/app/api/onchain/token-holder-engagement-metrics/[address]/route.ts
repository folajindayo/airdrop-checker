import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-engagement-metrics/[address]
 * Calculate holder engagement metrics
 * Measures active participation
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
    const cacheKey = `onchain-engagement:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const engagement: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      engagementScore: 0,
      activeHolders: 0,
      transactionFrequency: 0,
      timestamp: Date.now(),
    };

    try {
      const holdersResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (holdersResponse.data?.items) {
        const holders = holdersResponse.data.items;
        const now = Date.now();
        const activeThreshold = 30 * 24 * 60 * 60 * 1000;
        
        const active = holders.filter((h: any) => {
          const lastTx = h.last_transaction_date;
          if (!lastTx) return false;
          return (now - new Date(lastTx).getTime()) < activeThreshold;
        });
        
        engagement.activeHolders = active.length;
        engagement.transactionFrequency = holders.length > 0 
          ? (active.length / holders.length) * 100 
          : 0;
        engagement.engagementScore = engagement.transactionFrequency;
      }
    } catch (error) {
      console.error('Error calculating engagement:', error);
    }

    cache.set(cacheKey, engagement, 10 * 60 * 1000);

    return NextResponse.json(engagement);
  } catch (error) {
    console.error('Engagement metrics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate engagement metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

