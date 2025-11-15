import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-lifecycle/[address]
 * Analyze holder lifecycle stages
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
    const cacheKey = `onchain-holder-lifecycle:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const lifecycle: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      newHolders: 0,
      activeHolders: 0,
      dormantHolders: 0,
      lifecycleDistribution: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const newH = holders.filter((h: any) => {
          const firstTransfer = new Date(h.first_transferred_at || 0);
          const daysAgo = (Date.now() - firstTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 30;
        });
        const active = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 90 && daysAgo >= 30;
        });
        const dormant = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo >= 90;
        });
        lifecycle.newHolders = newH.length;
        lifecycle.activeHolders = active.length;
        lifecycle.dormantHolders = dormant.length;
        lifecycle.lifecycleDistribution = {
          new: (newH.length / holders.length) * 100,
          active: (active.length / holders.length) * 100,
          dormant: (dormant.length / holders.length) * 100,
        };
      }
    } catch (error) {
      console.error('Error analyzing lifecycle:', error);
    }

    cache.set(cacheKey, lifecycle, 5 * 60 * 1000);

    return NextResponse.json(lifecycle);
  } catch (error) {
    console.error('Holder lifecycle error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holder lifecycle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
