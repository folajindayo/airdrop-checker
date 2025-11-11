import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * POST /api/filter
 * Advanced filtering and aggregation with complex queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, aggregations, sort, limit, offset } = body;

    let projects = await findAllProjects();

    // Apply filters
    if (filters) {
      if (filters.status && Array.isArray(filters.status)) {
        projects = projects.filter((p) => filters.status.includes(p.status));
      }

      if (filters.chains && Array.isArray(filters.chains)) {
        projects = projects.filter((p) =>
          p.chains?.some((c) => filters.chains.includes(c))
        );
      }

      if (filters.hasSnapshot !== undefined) {
        projects = projects.filter((p) => !!p.snapshotDate === filters.hasSnapshot);
      }

      if (filters.hasClaim !== undefined) {
        projects = projects.filter((p) => !!p.claimUrl === filters.hasClaim);
      }

      if (filters.hasValue !== undefined) {
        projects = projects.filter((p) => !!p.estimatedValue === filters.hasValue);
      }

      if (filters.minCriteria) {
        projects = projects.filter(
          (p) => (Array.isArray(p.criteria) ? p.criteria.length : 0) >= filters.minCriteria
        );
      }

      if (filters.maxCriteria) {
        projects = projects.filter(
          (p) => (Array.isArray(p.criteria) ? p.criteria.length : 0) <= filters.maxCriteria
        );
      }

      if (filters.snapshotBefore) {
        const beforeDate = new Date(filters.snapshotBefore);
        projects = projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) <= beforeDate;
        });
      }

      if (filters.snapshotAfter) {
        const afterDate = new Date(filters.snapshotAfter);
        projects = projects.filter((p) => {
          if (!p.snapshotDate) return false;
          return new Date(p.snapshotDate) >= afterDate;
        });
      }
    }

    // Apply sorting
    if (sort) {
      const { field, order = 'asc' } = sort;
      projects.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (field) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'criteria':
            aValue = Array.isArray(a.criteria) ? a.criteria.length : 0;
            bValue = Array.isArray(b.criteria) ? b.criteria.length : 0;
            break;
          case 'snapshot':
            aValue = a.snapshotDate ? new Date(a.snapshotDate).getTime() : 0;
            bValue = b.snapshotDate ? new Date(b.snapshotDate).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Calculate aggregations
    const aggregationResults: Record<string, any> = {};

    if (aggregations) {
      if (aggregations.groupByStatus) {
        aggregationResults.byStatus = {
          confirmed: projects.filter((p) => p.status === 'confirmed').length,
          rumored: projects.filter((p) => p.status === 'rumored').length,
          speculative: projects.filter((p) => p.status === 'speculative').length,
          expired: projects.filter((p) => p.status === 'expired').length,
        };
      }

      if (aggregations.groupByChain) {
        const chainGroups: Record<string, number> = {};
        projects.forEach((p) => {
          p.chains?.forEach((chain) => {
            chainGroups[chain] = (chainGroups[chain] || 0) + 1;
          });
        });
        aggregationResults.byChain = chainGroups;
      }

      if (aggregations.avgCriteria) {
        const totalCriteria = projects.reduce(
          (sum, p) => sum + (Array.isArray(p.criteria) ? p.criteria.length : 0),
          0
        );
        aggregationResults.avgCriteria =
          projects.length > 0 ? totalCriteria / projects.length : 0;
      }

      if (aggregations.countWithSnapshot) {
        aggregationResults.countWithSnapshot = projects.filter((p) => !!p.snapshotDate).length;
      }
    }

    // Apply pagination
    const total = projects.length;
    const paginatedProjects = projects.slice(offset || 0, (offset || 0) + (limit || 50));

    return NextResponse.json({
      success: true,
      results: paginatedProjects.map((p) => ({
        projectId: p.projectId,
        name: p.name,
        status: p.status,
        chains: p.chains || [],
        criteriaCount: Array.isArray(p.criteria) ? p.criteria.length : 0,
        snapshotDate: p.snapshotDate,
        claimUrl: p.claimUrl,
        estimatedValue: p.estimatedValue,
      })),
      pagination: {
        total,
        limit: limit || 50,
        offset: offset || 0,
        hasMore: (offset || 0) + (limit || 50) < total,
      },
      aggregations: aggregationResults,
    });
  } catch (error) {
    console.error('Filter API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to filter projects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



