import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-migration/[address]
 * Track holder migration patterns
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
    const cacheKey = `onchain-holder-migration:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const migration: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      migrationRate: 0,
      newHolders: 0,
      departedHolders: 0,
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
          return daysAgo < 7;
        });
        migration.newHolders = newHolders.length;
        migration.migrationRate = holders.length > 0 ? 
          (newHolders.length / holders.length) * 100 : 0;
      }
    } catch (error) {
      console.error('Error tracking migration:', error);
    }

    cache.set(cacheKey, migration, 5 * 60 * 1000);

    return NextResponse.json(migration);
  } catch (error) {
    console.error('Holder migration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
