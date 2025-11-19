import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-migration-tracker/[address]
 * Track liquidity migration between pools
 * Monitors liquidity movement patterns
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-liq-migration:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const migration: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      migrationRate: 0,
      dominantPool: null,
      poolDistribution: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 20 }
      );

      if (response.data?.items) {
        const pools = response.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        
        if (pools.length > 0 && totalLiquidity > 0) {
          migration.dominantPool = pools[0].address;
          const topPoolLiquidity = parseFloat(pools[0].total_liquidity_quote || '0');
          migration.migrationRate = ((totalLiquidity - topPoolLiquidity) / totalLiquidity) * 100;
          
          migration.poolDistribution = pools.slice(0, 5).map((p: any) => ({
            address: p.address,
            liquidity: parseFloat(p.total_liquidity_quote || '0'),
            share: (parseFloat(p.total_liquidity_quote || '0') / totalLiquidity) * 100,
          }));
        }
      }
    } catch (error) {
      console.error('Error tracking migration:', error);
    }

    cache.set(cacheKey, migration, 10 * 60 * 1000);

    return NextResponse.json(migration);
  } catch (error) {
    console.error('Liquidity migration tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track liquidity migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

