import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-diversity/[address]
 * Measure holder diversity metrics
 * Analyzes distribution across holder types
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
    const cacheKey = `onchain-holder-diversity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const diversity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      diversityScore: 0,
      holderTypes: 0,
      distribution: {} as Record<string, number>,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalValue = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.quote || '0'), 0);

        const categories = new Set<string>();
        holders.forEach((holder: any) => {
          const value = parseFloat(holder.quote || '0');
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
          
          if (percentage > 1) categories.add('whale');
          else if (percentage > 0.1) categories.add('dolphin');
          else if (percentage > 0.01) categories.add('fish');
          else categories.add('retail');
        });

        diversity.holderTypes = categories.size;
        diversity.diversityScore = categories.size * 25;
      }
    } catch (error) {
      console.error('Error measuring diversity:', error);
    }

    cache.set(cacheKey, diversity, 5 * 60 * 1000);

    return NextResponse.json(diversity);
  } catch (error) {
    console.error('Holder diversity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure holder diversity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
