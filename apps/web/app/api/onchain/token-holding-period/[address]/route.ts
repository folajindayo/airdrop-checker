import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holding-period/[address]
 * Analyze average holding periods
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
    const cacheKey = `onchain-holding-period:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const holdingPeriod: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      averageHoldingDays: 0,
      medianHoldingDays: 0,
      hodlRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const holdingPeriods = holders.map((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          return (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
        }).filter((days: number) => days > 0);

        if (holdingPeriods.length > 0) {
          holdingPeriod.averageHoldingDays = holdingPeriods.reduce((a: number, b: number) => a + b, 0) / holdingPeriods.length;
          holdingPeriod.hodlRate = holdingPeriods.filter((days: number) => days > 30).length / holdingPeriods.length * 100;
        }
      }
    } catch (error) {
      console.error('Error analyzing holding period:', error);
    }

    cache.set(cacheKey, holdingPeriod, 5 * 60 * 1000);

    return NextResponse.json(holdingPeriod);
  } catch (error) {
    console.error('Holding period error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holding period',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





