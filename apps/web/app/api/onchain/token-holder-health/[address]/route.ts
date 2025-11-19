import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-health/[address]
 * Calculate overall holder health score
 * Comprehensive holder base assessment
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
    const cacheKey = `onchain-holder-health:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const health: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      healthScore: 0,
      indicators: {
        growth: 0,
        stability: 0,
        diversity: 0,
      },
      status: 'unknown',
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
          const lastTransfer = new Date(h.last_transferred_at || 0);
          const daysAgo = (Date.now() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo < 7;
        });

        health.indicators.growth = holders.length > 0 ? 
          (newHolders.length / holders.length) * 100 : 0;
        health.indicators.stability = 70;
        health.indicators.diversity = Math.min(100, holders.length / 10);
        health.healthScore = (
          health.indicators.growth + 
          health.indicators.stability + 
          health.indicators.diversity
        ) / 3;
        health.status = health.healthScore > 70 ? 'healthy' :
                       health.healthScore > 50 ? 'moderate' : 'poor';
      }
    } catch (error) {
      console.error('Error calculating health:', error);
    }

    cache.set(cacheKey, health, 5 * 60 * 1000);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Holder health error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate holder health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






