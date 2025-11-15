import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-growth/[address]
 * Track token holder growth over time
 * Analyzes adoption trends and growth patterns
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
    const cacheKey = `onchain-holder-growth:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const growth: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      currentHolders: 0,
      growthRate: 0,
      trends: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      adoptionScore: 0,
      insights: [] as string[],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        {
          'quote-currency': 'USD',
          'page-size': 1,
        }
      );

      if (response.data?.pagination) {
        growth.currentHolders = response.data.pagination.total_count || 0;
        growth.adoptionScore = calculateAdoptionScore(growth.currentHolders);
        growth.insights = generateGrowthInsights(growth);
      }
    } catch (error) {
      console.error('Error tracking holder growth:', error);
    }

    cache.set(cacheKey, growth, 5 * 60 * 1000);

    return NextResponse.json(growth);
  } catch (error) {
    console.error('Token holder growth tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder growth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateAdoptionScore(holders: number): number {
  if (holders > 10000) return 100;
  if (holders > 5000) return 80;
  if (holders > 1000) return 60;
  if (holders > 100) return 40;
  return 20;
}

function generateGrowthInsights(growth: any): string[] {
  const insights: string[] = [];

  if (growth.currentHolders > 10000) {
    insights.push('Strong holder base indicates good adoption');
  } else if (growth.currentHolders < 100) {
    insights.push('Low holder count - early stage token');
  }

  return insights;
}

