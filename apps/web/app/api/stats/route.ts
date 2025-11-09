import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

/**
 * GET /api/stats
 * Returns global statistics about tracked airdrops
 */
export async function GET() {
  try {
    const projects = await findAllProjects();

    // Calculate statistics
    const stats = {
      total: {
        projects: projects.length,
        confirmed: projects.filter((p) => p.status === 'confirmed').length,
        rumored: projects.filter((p) => p.status === 'rumored').length,
        speculative: projects.filter((p) => p.status === 'speculative').length,
        expired: projects.filter((p) => p.status === 'expired').length,
      },
      chains: {
        ethereum: projects.filter((p) => p.chains?.includes('Ethereum')).length,
        base: projects.filter((p) => p.chains?.includes('Base')).length,
        arbitrum: projects.filter((p) => p.chains?.includes('Arbitrum')).length,
        optimism: projects.filter((p) => p.chains?.includes('Optimism')).length,
        zkSync: projects.filter((p) => p.chains?.includes('zkSync Era')).length,
        polygon: projects.filter((p) => p.chains?.includes('Polygon')).length,
      },
      criteria: {
        totalCriteria: projects.reduce(
          (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
          0
        ),
        avgCriteriaPerProject: projects.length > 0
          ? Math.round(
              projects.reduce(
                (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
                0
              ) / projects.length
            )
          : 0,
      },
      estimated: {
        withValue: projects.filter((p) => p.estimatedValue).length,
        totalEstimatedValue: projects
          .filter((p) => p.estimatedValue)
          .map((p) => p.estimatedValue || '')
          .join(', '),
      },
      snapshots: {
        upcoming: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) > new Date();
        }).length,
        past: projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) <= new Date();
        }).length,
        tbd: projects.filter((p) => !p.snapshotDate).length,
      },
      topProjects: projects
        .filter((p) => p.status === 'confirmed')
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          status: p.status,
          chains: p.chains || [],
          criteriaCount: Array.isArray(p.criteria) ? p.criteria.length : 0,
          hasSnapshot: !!p.snapshotDate,
          hasClaimUrl: !!p.claimUrl,
        })),
      recentUpdates: projects
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          status: p.status,
          updatedAt: p.updatedAt,
        })),
    };

    // Calculate engagement metrics
    const engagement = {
      activeAirdrops: projects.filter(
        (p) => p.status === 'confirmed' || p.status === 'rumored'
      ).length,
      multiChainProjects: projects.filter(
        (p) => p.chains && p.chains.length > 1
      ).length,
      claimableNow: projects.filter(
        (p) => p.status === 'confirmed' && p.claimUrl
      ).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      engagement,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

