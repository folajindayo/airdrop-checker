import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-lifecycle/[address]
 * Track holder lifecycle stages
 * Analyzes holder journey from new to veteran
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
      stages: {
        new: 0,
        active: 0,
        established: 0,
        veteran: 0,
      },
      averageAge: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        let totalAge = 0;

        holders.forEach((holder: any) => {
          const lastTransfer = new Date(holder.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          totalAge += daysAgo;

          if (daysAgo < 7) lifecycle.stages.new++;
          else if (daysAgo < 30) lifecycle.stages.active++;
          else if (daysAgo < 180) lifecycle.stages.established++;
          else lifecycle.stages.veteran++;
        });

        lifecycle.averageAge = holders.length > 0 ? totalAge / holders.length : 0;
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

