import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface AggregatedAnalytics {
  address: string;
  timeframe: string;
  overview: {
    totalAirdrops: number;
    eligibleAirdrops: number;
    averageScore: number;
    totalPotentialValue: number;
    activityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  breakdown: {
    byStatus: Record<string, number>;
    byChain: Record<string, number>;
    byCategory: Record<string, number>;
    scoreDistribution: {
      excellent: number; // 80-100
      good: number; // 60-79
      fair: number; // 40-59
      poor: number; // 0-39
    };
  };
  trends: {
    scoreChange: number;
    newAirdrops: number;
    improvedAirdrops: number;
    topPerformingChains: string[];
  };
  insights: string[];
  recommendations: string[];
}

/**
 * POST /api/analytics-aggregator
 * Get comprehensive analytics and insights for a wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, timeframe = '30d' } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch eligibility data
    const eligibilityResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/airdrop-check/${normalizedAddress}`
    ).catch(() => null);

    let airdrops: any[] = [];
    let overallScore = 0;

    if (eligibilityResponse?.ok) {
      const data = await eligibilityResponse.json();
      overallScore = data.overallScore || 0;
      airdrops = data.airdrops || [];
    }

    // Calculate overview metrics
    const eligibleAirdrops = airdrops.filter((a) => a.score >= 50);
    const totalPotentialValue = airdrops.reduce((sum, a) => {
      const value = parseFloat((a.estimatedValue || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + value * (a.score / 100);
    }, 0);

    // Breakdown by status
    const byStatus: Record<string, number> = {};
    airdrops.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    // Breakdown by chain
    const byChain: Record<string, number> = {};
    airdrops.forEach((a) => {
      const chains = a.chains || ['Ethereum'];
      chains.forEach((chain: string) => {
        byChain[chain] = (byChain[chain] || 0) + 1;
      });
    });

    // Score distribution
    const scoreDistribution = {
      excellent: airdrops.filter((a) => a.score >= 80).length,
      good: airdrops.filter((a) => a.score >= 60 && a.score < 80).length,
      fair: airdrops.filter((a) => a.score >= 40 && a.score < 60).length,
      poor: airdrops.filter((a) => a.score < 40).length,
    };

    // Calculate trends (mock - in production, compare with historical data)
    const scoreChange = Math.floor(Math.random() * 20) - 10; // Mock
    const newAirdrops = Math.floor(Math.random() * 5);
    const improvedAirdrops = Math.floor(Math.random() * 10);

    // Top performing chains
    const topPerformingChains = Object.entries(byChain)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([chain]) => chain);

    // Determine activity trend
    let activityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (scoreChange > 5) activityTrend = 'increasing';
    else if (scoreChange < -5) activityTrend = 'decreasing';

    // Generate insights
    const insights: string[] = [];
    if (overallScore >= 70) {
      insights.push('Strong overall eligibility with high average score');
    }
    if (eligibleAirdrops.length > airdrops.length * 0.5) {
      insights.push('Majority of airdrops are eligible');
    }
    if (topPerformingChains.length >= 3) {
      insights.push('Good multi-chain diversification');
    }
    if (scoreDistribution.excellent > scoreDistribution.poor) {
      insights.push('More excellent scores than poor scores');
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (scoreDistribution.poor > scoreDistribution.excellent) {
      recommendations.push('Focus on improving scores for low-performing airdrops');
    }
    if (topPerformingChains.length < 3) {
      recommendations.push('Expand activity to more chains for better diversification');
    }
    if (totalPotentialValue < 1000) {
      recommendations.push('Consider focusing on higher-value airdrop opportunities');
    }
    if (activityTrend === 'decreasing') {
      recommendations.push('Activity trend is decreasing. Increase interactions to maintain scores');
    }

    const result: AggregatedAnalytics = {
      address: normalizedAddress,
      timeframe,
      overview: {
        totalAirdrops: airdrops.length,
        eligibleAirdrops: eligibleAirdrops.length,
        averageScore: overallScore,
        totalPotentialValue: Math.round(totalPotentialValue),
        activityTrend,
      },
      breakdown: {
        byStatus,
        byChain,
        byCategory: {}, // Would be populated from airdrop categories
        scoreDistribution,
      },
      trends: {
        scoreChange,
        newAirdrops,
        improvedAirdrops,
        topPerformingChains,
      },
      insights,
      recommendations,
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Analytics aggregator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

