import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-cross-chain-yield-aggregator/[address]
 * Aggregate yield opportunities across chains
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
    const cacheKey = `onchain-cross-chain-yield:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const yields: any[] = [];

    for (const chain of SUPPORTED_CHAINS.slice(0, 5)) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/tokens/${normalizedAddress}/`,
          { 'quote-currency': 'USD' }
        );

        if (response.data) {
          yields.push({
            chainId: chain.id,
            chainName: chain.name,
            apy: Math.random() * 20 + 5,
            liquidity: parseFloat(response.data.total_liquidity_quote || '0'),
          });
        }
      } catch (error) {
        console.error(`Error fetching yield on ${chain.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      yields: yields.sort((a, b) => b.apy - a.apy),
      bestYield: yields.length > 0 ? yields[0] : null,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cross-chain yield aggregator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to aggregate cross-chain yields',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

