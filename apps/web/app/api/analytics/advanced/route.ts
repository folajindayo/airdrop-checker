import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/advanced
 * Get advanced analytics with trends and predictions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30'; // days

    const projects = await findAllProjects();

    // Calculate trends
    const trends = {
      newAirdrops: projects.filter((p) => {
        if (!p.createdAt) return false;
        const daysSince = Math.floor(
          (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSince <= parseInt(timeframe, 10);
      }).length,

      confirmedAirdrops: projects.filter((p) => p.status === 'confirmed').length,
      rumoredAirdrops: projects.filter((p) => p.status === 'rumored').length,

      chainGrowth: {
        ethereum: projects.filter((p) => p.chains?.includes('Ethereum')).length,
        base: projects.filter((p) => p.chains?.includes('Base')).length,
        arbitrum: projects.filter((p) => p.chains?.includes('Arbitrum')).length,
        optimism: projects.filter((p) => p.chains?.includes('Optimism')).length,
        zkSync: projects.filter((p) => p.chains?.includes('zkSync Era')).length,
        polygon: projects.filter((p) => p.chains?.includes('Polygon')).length,
      },

      valueDistribution: {
        withValue: projects.filter((p) => p.estimatedValue).length,
        withoutValue: projects.filter((p) => !p.estimatedValue).length,
      },

      snapshotTimeline: {
        upcoming: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) > new Date();
        }).length,
        past: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) <= new Date();
        }).length,
      },
    };

    // Calculate predictions
    const predictions = {
      likelyToConfirm: projects.filter((p) => {
        if (p.status !== 'rumored') return false;
        const criteriaCount = Array.isArray(p.criteria) ? p.criteria.length : 0;
        const hasValue = !!p.estimatedValue;
        const isMultiChain = p.chains && p.chains.length > 1;
        return criteriaCount > 0 && (hasValue || isMultiChain);
      }).length,

      estimatedTotalValue: projects
        .filter((p) => p.estimatedValue)
        .length * 1000, // Mock calculation

      averageCriteriaCount: projects.length > 0
        ? Math.round(
            projects.reduce(
              (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
              0
            ) / projects.length
          )
        : 0,
    };

    // Calculate engagement metrics
    const engagement = {
      activeProjects: projects.filter(
        (p) => p.status === 'confirmed' || p.status === 'rumored'
      ).length,
      claimableNow: projects.filter(
        (p) => p.status === 'confirmed' && p.claimUrl
      ).length,
      multiChainProjects: projects.filter(
        (p) => p.chains && p.chains.length > 1
      ).length,
    };

    return NextResponse.json({
      success: true,
      trends,
      predictions,
      engagement,
      timeframe: parseInt(timeframe, 10),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Advanced Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch advanced analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



