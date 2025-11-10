import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics
 * Get platform-wide analytics and statistics
 */
export async function GET() {
  try {
    const projects = await findAllProjects();

    // Calculate comprehensive analytics
    const analytics = {
      // Project statistics
      projects: {
        total: projects.length,
        byStatus: {
          confirmed: projects.filter((p) => p.status === 'confirmed').length,
          rumored: projects.filter((p) => p.status === 'rumored').length,
          speculative: projects.filter((p) => p.status === 'speculative').length,
          expired: projects.filter((p) => p.status === 'expired').length,
        },
        withSnapshots: projects.filter((p) => p.snapshotDate).length,
        withClaims: projects.filter((p) => p.claimUrl).length,
        withValues: projects.filter((p) => p.estimatedValue).length,
      },

      // Chain distribution
      chains: {
        ethereum: projects.filter((p) => p.chains?.includes('Ethereum')).length,
        base: projects.filter((p) => p.chains?.includes('Base')).length,
        arbitrum: projects.filter((p) => p.chains?.includes('Arbitrum')).length,
        optimism: projects.filter((p) => p.chains?.includes('Optimism')).length,
        zkSync: projects.filter((p) => p.chains?.includes('zkSync Era')).length,
        polygon: projects.filter((p) => p.chains?.includes('Polygon')).length,
        multiChain: projects.filter((p) => p.chains && p.chains.length > 1).length,
      },

      // Criteria analysis
      criteria: {
        total: projects.reduce(
          (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
          0
        ),
        average: projects.length > 0
          ? Math.round(
              projects.reduce(
                (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
                0
              ) / projects.length
            )
          : 0,
        min: Math.min(
          ...projects.map((p) => (Array.isArray(p.criteria) ? p.criteria.length : 0))
        ),
        max: Math.max(
          ...projects.map((p) => (Array.isArray(p.criteria) ? p.criteria.length : 0))
        ),
      },

      // Timeline analysis
      timeline: {
        upcomingSnapshots: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) > new Date();
        }).length,
        pastSnapshots: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) <= new Date();
        }).length,
        nextSnapshot: projects
          .filter((p) => {
            if (!p.snapshotDate) return false;
            return new Date(p.snapshotDate) > new Date();
          })
          .sort((a, b) => {
            const dateA = new Date(a.snapshotDate!).getTime();
            const dateB = new Date(b.snapshotDate!).getTime();
            return dateA - dateB;
          })[0]?.snapshotDate || null,
      },

      // Value analysis
      value: {
        projectsWithValue: projects.filter((p) => p.estimatedValue).length,
        averageValue: 0, // Would calculate from estimated values if parsed
      },

      // Activity metrics (mock - would be real in production)
      activity: {
        totalChecks: 12500,
        uniqueAddresses: 3200,
        averageScore: 65,
        topScore: 98,
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

