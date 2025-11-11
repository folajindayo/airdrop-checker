import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * Advanced search and filtering for airdrops
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const chain = searchParams.get('chain');
    const minScore = searchParams.get('minScore');
    const hasSnapshot = searchParams.get('hasSnapshot');
    const hasClaim = searchParams.get('hasClaim');
    const hasValue = searchParams.get('hasValue');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let projects = await findAllProjects();

    // Text search
    if (query) {
      const queryLower = query.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.projectId.toLowerCase().includes(queryLower) ||
          p.slug.toLowerCase().includes(queryLower) ||
          p.description?.toLowerCase().includes(queryLower) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
      );
    }

    // Status filter
    if (status) {
      projects = projects.filter((p) => p.status === status);
    }

    // Chain filter
    if (chain) {
      projects = projects.filter(
        (p) => p.chains && p.chains.some((c) => c.toLowerCase() === chain.toLowerCase())
      );
    }

    // Has snapshot filter
    if (hasSnapshot === 'true') {
      projects = projects.filter((p) => !!p.snapshotDate);
    } else if (hasSnapshot === 'false') {
      projects = projects.filter((p) => !p.snapshotDate);
    }

    // Has claim filter
    if (hasClaim === 'true') {
      projects = projects.filter((p) => !!p.claimUrl);
    } else if (hasClaim === 'false') {
      projects = projects.filter((p) => !p.claimUrl);
    }

    // Has value filter
    if (hasValue === 'true') {
      projects = projects.filter((p) => !!p.estimatedValue);
    } else if (hasValue === 'false') {
      projects = projects.filter((p) => !p.estimatedValue);
    }

    // Sort
    projects.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
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
        case 'chains':
          aValue = a.chains?.length || 0;
          bValue = b.chains?.length || 0;
          break;
        case 'snapshot':
          aValue = a.snapshotDate ? new Date(a.snapshotDate).getTime() : 0;
          bValue = b.snapshotDate ? new Date(b.snapshotDate).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply limit
    const limitedProjects = projects.slice(0, limit);

    // Format results
    const results = limitedProjects.map((project) => ({
      projectId: project.projectId,
      name: project.name,
      slug: project.slug,
      status: project.status,
      chains: project.chains || [],
      criteriaCount: Array.isArray(project.criteria) ? project.criteria.length : 0,
      snapshotDate: project.snapshotDate,
      claimUrl: project.claimUrl,
      estimatedValue: project.estimatedValue,
      tags: project.tags || [],
      description: project.description,
    }));

    return NextResponse.json({
      success: true,
      results,
      total: projects.length,
      returned: results.length,
      filters: {
        query,
        status,
        chain,
        hasSnapshot,
        hasClaim,
        hasValue,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search airdrops',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



