import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-analytics/[address]
 * Comprehensive analytics for token holders
 * Uses Reown Wallet data for on-chain analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-token-holder-analytics:${normalizedAddress}:${chainId || 'all'}:${limit}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const targetChain = SUPPORTED_CHAINS.find(c => c.id === targetChainId) || SUPPORTED_CHAINS[0];

    const analytics: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      chainName: targetChain.name,
      holderDistribution: {
        totalHolders: 0,
        activeHolders: 0,
        whaleCount: 0,
        retailCount: 0,
      },
      concentration: {
        top10Percent: 0,
        top50Percent: 0,
        giniCoefficient: 0,
        herfindahlIndex: 0,
      },
      holderBehavior: {
        averageHoldTime: 0,
        churnRate: 0,
        newHolders: 0,
        lostHolders: 0,
      },
      insights: [] as string[],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        {
          'quote-currency': 'USD',
          'page-size': limit,
        }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalSupply = response.data.pagination?.total_count || holders.length;

        analytics.holderDistribution.totalHolders = totalSupply;
        analytics.holderDistribution.activeHolders = holders.length;

        const balances = holders.map((h: any) => parseFloat(h.balance || '0'));
        const totalBalance = balances.reduce((sum: number, b: number) => sum + b, 0);

        if (totalBalance > 0) {
          const sortedBalances = [...balances].sort((a, b) => b - a);
          const top10Balance = sortedBalances.slice(0, 10).reduce((sum, b) => sum + b, 0);
          const top50Balance = sortedBalances.slice(0, Math.min(50, sortedBalances.length))
            .reduce((sum, b) => sum + b, 0);

          analytics.concentration.top10Percent = (top10Balance / totalBalance) * 100;
          analytics.concentration.top50Percent = (top50Balance / totalBalance) * 100;
          analytics.concentration.giniCoefficient = calculateGiniCoefficient(sortedBalances);
          analytics.concentration.herfindahlIndex = calculateHerfindahlIndex(balances, totalBalance);

          const whaleThreshold = totalBalance * 0.01;
          analytics.holderDistribution.whaleCount = balances.filter(b => b >= whaleThreshold).length;
          analytics.holderDistribution.retailCount = balances.filter(b => b < whaleThreshold).length;
        }

        analytics.insights = generateInsights(analytics);
      }
    } catch (error) {
      console.error('Error fetching token holder analytics:', error);
    }

    cache.set(cacheKey, analytics, 5 * 60 * 1000);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Token holder analytics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token holders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateGiniCoefficient(sortedBalances: number[]): number {
  if (sortedBalances.length === 0) return 0;

  const n = sortedBalances.length;
  const sum = sortedBalances.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;

  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sortedBalances[i];
  }

  return numerator / (n * sum);
}

function calculateHerfindahlIndex(balances: number[], total: number): number {
  if (total === 0) return 0;

  return balances.reduce((sum, balance) => {
    const share = balance / total;
    return sum + (share * share);
  }, 0);
}

function generateInsights(analytics: any): string[] {
  const insights: string[] = [];

  if (analytics.concentration.top10Percent > 50) {
    insights.push('High concentration: Top 10 holders control majority of supply');
  }

  if (analytics.concentration.giniCoefficient > 0.7) {
    insights.push('Very unequal distribution detected');
  }

  if (analytics.holderDistribution.whaleCount > analytics.holderDistribution.retailCount) {
    insights.push('Whale-dominated token with few retail holders');
  } else {
    insights.push('Good retail distribution');
  }

  if (analytics.concentration.herfindahlIndex > 0.25) {
    insights.push('High market concentration risk');
  }

  return insights;
}

