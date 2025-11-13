import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/dashboard
 * Comprehensive analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30'; // days

    const projects = await findAllProjects();
    const days = parseInt(timeframe, 10);

    // Calculate comprehensive dashboard metrics
    const dashboard = {
      // Overview metrics
      overview: {
        totalProjects: projects.length,
        activeProjects: projects.filter(
          (p) => p.status === 'confirmed' || p.status === 'rumored'
        ).length,
        confirmedAirdrops: projects.filter((p) => p.status === 'confirmed').length,
        totalEstimatedValue: calculateTotalEstimatedValue(projects),
        averageCriteriaPerProject: calculateAverageCriteria(projects),
      },

      // Trend metrics
      trends: {
        newProjectsLast30Days: projects.filter((p) => {
          if (!p.createdAt) return false;
          const daysSince = Math.floor(
            (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince <= days;
        }).length,
        confirmedLast30Days: projects.filter((p) => {
          if (!p.updatedAt) return false;
          const daysSince = Math.floor(
            (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return p.status === 'confirmed' && daysSince <= days;
        }).length,
        growthRate: calculateGrowthRate(projects, days),
      },

      // Chain distribution
      chains: {
        distribution: calculateChainDistribution(projects),
        multiChainCount: projects.filter((p) => p.chains && p.chains.length > 1).length,
        mostPopularChain: getMostPopularChain(projects),
      },

      // Timeline analysis
      timeline: {
        upcomingSnapshots: projects
          .filter((p) => {
            if (!p.snapshotDate) return false;
            return new Date(p.snapshotDate) > new Date();
          })
          .sort((a, b) => {
            const dateA = new Date(a.snapshotDate!).getTime();
            const dateB = new Date(b.snapshotDate!).getTime();
            return dateA - dateB;
          })
          .slice(0, 10)
          .map((p) => ({
            name: p.name,
            snapshotDate: p.snapshotDate,
            daysUntil: Math.ceil(
              (new Date(p.snapshotDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ),
          })),
        nextSnapshot: getNextSnapshot(projects),
      },

      // Value analysis
      value: {
        projectsWithValue: projects.filter((p) => p.estimatedValue).length,
        valueDistribution: calculateValueDistribution(projects),
        averageValue: calculateAverageValue(projects),
        totalPotentialValue: calculateTotalEstimatedValue(projects),
      },

      // Criteria analysis
      criteria: {
        totalCriteria: projects.reduce(
          (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
          0
        ),
        averageCriteria: calculateAverageCriteria(projects),
        mostCommonCriteria: getMostCommonCriteria(projects),
        criteriaDistribution: getCriteriaDistribution(projects),
      },

      // Status breakdown
      status: {
        confirmed: projects.filter((p) => p.status === 'confirmed').length,
        rumored: projects.filter((p) => p.status === 'rumored').length,
        speculative: projects.filter((p) => p.status === 'speculative').length,
        expired: projects.filter((p) => p.status === 'expired').length,
      },
    };

    return NextResponse.json({
      success: true,
      dashboard,
      timeframe: days,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateTotalEstimatedValue(projects: any[]): number {
  // Simplified calculation (in production, parse actual values)
  return projects.filter((p) => p.estimatedValue).length * 1000;
}

function calculateAverageCriteria(projects: any[]): number {
  if (projects.length === 0) return 0;
  const total = projects.reduce(
    (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
    0
  );
  return Math.round((total / projects.length) * 10) / 10;
}

function calculateGrowthRate(projects: any[], days: number): number {
  const recent = projects.filter((p) => {
    if (!p.createdAt) return false;
    const daysSince = Math.floor(
      (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince <= days;
  }).length;
  return projects.length > 0 ? (recent / projects.length) * 100 : 0;
}

function calculateChainDistribution(projects: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  projects.forEach((p) => {
    p.chains?.forEach((chain: string) => {
      distribution[chain] = (distribution[chain] || 0) + 1;
    });
  });
  return distribution;
}

function getMostPopularChain(projects: any[]): string | null {
  const distribution = calculateChainDistribution(projects);
  const entries = Object.entries(distribution);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function getNextSnapshot(projects: any[]): any | null {
  const upcoming = projects
    .filter((p) => {
      if (!p.snapshotDate) return false;
      return new Date(p.snapshotDate) > new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.snapshotDate!).getTime();
      const dateB = new Date(b.snapshotDate!).getTime();
      return dateA - dateB;
    });

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  return {
    name: next.name,
    snapshotDate: next.snapshotDate,
    daysUntil: Math.ceil(
      (new Date(next.snapshotDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
  };
}

function calculateValueDistribution(projects: any[]): Record<string, number> {
  // Simplified - would parse actual value ranges
  return {
    low: projects.filter((p) => p.estimatedValue && p.estimatedValue.includes('100')).length,
    medium: projects.filter((p) => p.estimatedValue && p.estimatedValue.includes('500')).length,
    high: projects.filter((p) => p.estimatedValue && p.estimatedValue.includes('1000')).length,
  };
}

function calculateAverageValue(projects: any[]): number {
  // Simplified calculation
  const withValue = projects.filter((p) => p.estimatedValue);
  return withValue.length * 500; // Mock average
}

function getMostCommonCriteria(projects: any[]): string[] {
  const criteriaCounts: Record<string, number> = {};
  projects.forEach((p) => {
    p.criteria?.forEach((c: any) => {
      const desc = c.description || '';
      if (desc) {
        criteriaCounts[desc] = (criteriaCounts[desc] || 0) + 1;
      }
    });
  });

  return Object.entries(criteriaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([desc]) => desc);
}

function getCriteriaDistribution(projects: any[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  projects.forEach((p) => {
    const count = Array.isArray(p.criteria) ? p.criteria.length : 0;
    distribution[count] = (distribution[count] || 0) + 1;
  });
  return distribution;
}



