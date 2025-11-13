import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holders/[address]
 * Analyze token holder distribution for a token
 * Uses GoldRush API for holder data
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
    const cacheKey = `onchain-token-holders:${normalizedAddress}:${chainId || 'all'}`;
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

    const holders: any[] = [];
    let totalSupply = 0;
    let holderCount = 0;

    for (const chain of targetChains) {
      try {
        // Get token holders from GoldRush
        const response = await goldrushClient.get(
          `/v2/${chain.id}/tokens/${normalizedAddress}/token_holders/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          const items = response.data.items;
          
          items.forEach((holder: any) => {
            holders.push({
              chainId: chain.id,
              chainName: chain.name,
              address: holder.address,
              balance: holder.balance,
              balanceFormatted: holder.pretty_quote,
              valueUSD: holder.quote,
              percentage: holder.percentage || 0,
            });
          });

          holderCount += items.length;
          if (response.data.pagination) {
            totalSupply = response.data.pagination.total_count || 0;
          }
        }
      } catch (error) {
        console.error(`Error fetching token holders on ${chain.name}:`, error);
      }
    }

    // Calculate distribution metrics
    const top10Holders = holders
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 10);

    const concentration = top10Holders.reduce((sum, h) => sum + (h.percentage || 0), 0);

    const result = {
      tokenAddress: normalizedAddress,
      holders: holders.slice(0, 100), // Limit to top 100
      analysis: {
        totalHolders: holderCount,
        totalSupply,
        top10Concentration: concentration,
        distribution: {
          highlyConcentrated: concentration > 50,
          moderatelyConcentrated: concentration > 20 && concentration <= 50,
          wellDistributed: concentration <= 20,
        },
        top10Holders,
      },
      timestamp: Date.now(),
    };

    // Cache for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token holders API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch token holders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

