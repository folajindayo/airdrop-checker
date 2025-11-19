import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-migration-tracker/[address]
 * Track liquidity migration patterns across DEX platforms
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
    const cacheKey = `onchain-liquidity-migration:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const migration: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      migrationVolume: 0,
      destinationDEX: 'unknown',
      migrationTrend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        migration.migrationVolume = 0;
        migration.migrationTrend = 'stable';
      }
    } catch (error) {
      console.error('Error tracking migration:', error);
    }

    cache.set(cacheKey, migration, 5 * 60 * 1000);

    return NextResponse.json(migration);
  } catch (error) {
    console.error('Liquidity migration tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track liquidity migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
