import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-churn/[address]
 * Measure holder churn rate
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
    const cacheKey = `onchain-holder-churn:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const churn: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      churnRate: 0,
      churnedHolders: 0,
      retentionRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const churned = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo > 90 && parseFloat(h.balance || '0') === 0;
        });
        churn.churnedHolders = churned.length;
        churn.churnRate = holders.length > 0 ? (churned.length / holders.length) * 100 : 0;
        churn.retentionRate = 100 - churn.churnRate;
      }
    } catch (error) {
      console.error('Error measuring churn:', error);
    }

    cache.set(cacheKey, churn, 5 * 60 * 1000);

    return NextResponse.json(churn);
  } catch (error) {
    console.error('Holder churn error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure holder churn',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
