import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-adoption-rate/[address]
 * Track token adoption rate
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
    const cacheKey = `onchain-adoption:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const adoption: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      holderGrowth: 0,
      adoptionRate: 0,
      newHolders24h: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const newHolders = holders.filter((h: any) => {
          const firstTransfer = new Date(h.first_transferred_at || 0);
          const daysAgo = (Date.now() - firstTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 1;
        });

        adoption.newHolders24h = newHolders.length;
        adoption.adoptionRate = holders.length > 0 ? 
          (newHolders.length / holders.length) * 100 : 0;
      }
    } catch (error) {
      console.error('Error tracking adoption:', error);
    }

    cache.set(cacheKey, adoption, 5 * 60 * 1000);

    return NextResponse.json(adoption);
  } catch (error) {
    console.error('Adoption rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track adoption rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

