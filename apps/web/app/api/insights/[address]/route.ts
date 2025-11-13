import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { findAllProjects } from '@/lib/db/models/project';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/insights/[address]
 * Get personalized insights and recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch user activity
    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    const projects = await findAllProjects();

    // Generate insights
    const insights = {
      // Activity insights
      activity: {
        totalTransactions: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
        chainsUsed: Object.keys(chainTransactions).length,
        nftCount: Object.values(chainNFTs).reduce((sum, nfts) => sum + nfts.length, 0),
        mostActiveChain: Object.entries(chainTransactions)
          .sort((a, b) => b[1].length - a[1].length)[0]?.[0] || null,
      },
      
      // Eligibility insights
      eligibility: {
        totalProjects: projects.length,
        eligibleCount: 0,
        averageScore: 0,
        topScore: 0,
        improvementAreas: [] as string[],
      },

      // Recommendations
      recommendations: [] as string[],
    };

    // Calculate eligibility metrics
    const scores: number[] = [];
    const eligibleProjects: string[] = [];

    projects.forEach((project) => {
      const criteriaResults = project.criteria?.map((criterion) =>
        checkCriteria(criterion, userActivity)
      ) || [];

      const score = criteriaResults.length > 0
        ? Math.round((criteriaResults.filter((c) => c).length / criteriaResults.length) * 100)
        : 0;

      scores.push(score);
      if (score >= 50) eligibleProjects.push(project.name);

      // Track missing criteria for recommendations
      if (score < 100) {
        project.criteria?.forEach((criterion, idx) => {
          if (!checkCriteria(criterion, userActivity)) {
            insights.eligibility.improvementAreas.push(criterion.description || '');
          }
        });
      }
    });

    insights.eligibility.eligibleCount = eligibleProjects.length;
    insights.eligibility.averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    insights.eligibility.topScore = Math.max(...scores, 0);

    // Generate recommendations
    if (insights.activity.chainsUsed < 3) {
      insights.recommendations.push('Try interacting with more chains to increase eligibility');
    }

    if (insights.activity.totalTransactions < 10) {
      insights.recommendations.push('Increase your onchain activity to improve scores');
    }

    if (insights.activity.nftCount === 0) {
      insights.recommendations.push('Consider minting NFTs on supported platforms');
    }

    const uniqueImprovements = [...new Set(insights.eligibility.improvementAreas)].slice(0, 5);
    uniqueImprovements.forEach((area) => {
      insights.recommendations.push(`Focus on: ${area}`);
    });

    // Activity patterns
    const activityPatterns = {
      isDiversified: insights.activity.chainsUsed >= 3,
      isActive: insights.activity.totalTransactions >= 20,
      hasNFTs: insights.activity.nftCount > 0,
      isMultiChain: insights.activity.chainsUsed > 1,
    };

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      insights,
      activityPatterns,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



