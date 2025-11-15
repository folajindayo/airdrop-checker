import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-loyalty/[address]
 * Measure holder loyalty and retention
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
    const cacheKey = `onchain-holder-loyalty:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const loyalty: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      loyaltyScore: 0,
      longTermHolders: 0,
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
        const longTerm = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo > 90;
        });

        loyalty.longTermHolders = longTerm.length;
        loyalty.retentionRate = holders.length > 0 ? 
          (longTerm.length / holders.length) * 100 : 0;
        loyalty.loyaltyScore = loyalty.retentionRate;
      }
    } catch (error) {
      console.error('Error measuring loyalty:', error);
    }

    cache.set(cacheKey, loyalty, 5 * 60 * 1000);

    return NextResponse.json(loyalty);
  } catch (error) {
    console.error('Holder loyalty error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure holder loyalty',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
