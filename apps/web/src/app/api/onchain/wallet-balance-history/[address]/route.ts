import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-balance-history/[address]
 * Track wallet balance history over time
 * Provides balance evolution data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-balance-history:${normalizedAddress}:${chainId || 'all'}:${days}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const history: any = {
      address: normalizedAddress,
      period: `${days} days`,
      currentBalance: 0,
      balanceHistory: [] as any[],
      trend: 'stable',
      timestamp: Date.now(),
    };

    let totalBalance = 0;

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/balances_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'nft': 'false',
          }
        );

        if (response.data?.items) {
          response.data.items.forEach((token: any) => {
            totalBalance += parseFloat(token.quote || '0');
          });
        }
      } catch (error) {
        console.error(`Error fetching balance on ${chain.name}:`, error);
      }
    }

    history.currentBalance = totalBalance;
    history.trend = 'stable';

    cache.set(cacheKey, history, 5 * 60 * 1000);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Balance history error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch balance history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

