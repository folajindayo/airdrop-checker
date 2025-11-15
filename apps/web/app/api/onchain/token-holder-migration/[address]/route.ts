import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-migration/[address]
 * Track holder migration patterns
 * Analyzes holder movement and retention
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
      newHolders: 0,
      lostHolders: 0,
      retentionRate: 0,
      migrationTrend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const recentHolders = holders.filter((h: any) => {
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 30;
        });

        migration.newHolders = recentHolders.length;
        migration.retentionRate = holders.length > 0 ? 
          ((holders.length - recentHolders.length) / holders.length) * 100 : 0;
        migration.migrationTrend = migration.newHolders > migration.lostHolders ? 
          'growing' : migration.lostHolders > migration.newHolders ? 'declining' : 'stable';
      }
    } catch (error) {
      console.error('Error tracking migration:', error);
    }

    cache.set(cacheKey, migration, 5 * 60 * 1000);

    return NextResponse.json(migration);
  } catch (error) {
    console.error('Holder migration tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

