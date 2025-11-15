import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-value-distribution/[address]
 * Analyze value distribution among holders
 * Categorizes holders by holding size
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
    const cacheKey = `onchain-value-distribution:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const distribution: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      whales: 0,
      dolphins: 0,
      fish: 0,
      shrimp: 0,
      totalValue: 0,
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
        
        distribution.totalValue = totalValue;
        const whaleThreshold = totalValue * 0.01;
        const dolphinThreshold = totalValue * 0.001;
        const fishThreshold = totalValue * 0.0001;

        holders.forEach((holder: any) => {
          const value = parseFloat(holder.quote || '0');
          if (value >= whaleThreshold) distribution.whales++;
          else if (value >= dolphinThreshold) distribution.dolphins++;
          else if (value >= fishThreshold) distribution.fish++;
          else distribution.shrimp++;
        });
      }
    } catch (error) {
      console.error('Error analyzing distribution:', error);
    }

    cache.set(cacheKey, distribution, 5 * 60 * 1000);

    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Value distribution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze value distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

