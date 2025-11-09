import { NextRequest, NextResponse } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import type { AirdropProject, AirdropStatus } from '@airdrop-finder/shared';
import { findAllProjects, findProjectsByStatus } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/airdrops
 * Get list of all airdrop projects
 * Query params:
 * - status: filter by status (confirmed, rumored, expired, speculative)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as AirdropStatus | null;

    // Build cache key
    const cacheKey = statusFilter
      ? `airdrops:status:${statusFilter}`
      : 'airdrops:all';

    // Check cache
    const cachedProjects = cache.get<AirdropProject[]>(cacheKey);

    if (cachedProjects) {
      return NextResponse.json({
        projects: cachedProjects,
        cached: true,
      });
    }

    // Fetch from database
    let projects: AirdropProject[];

    if (statusFilter) {
      projects = await findProjectsByStatus(statusFilter);
    } else {
      projects = await findAllProjects();
    }

    // Sort by status priority (confirmed > rumored > speculative > expired)
    const statusPriority: Record<AirdropStatus, number> = {
      confirmed: 4,
      rumored: 3,
      speculative: 2,
      expired: 1,
    };

    projects.sort((a, b) => {
      const priorityDiff = statusPriority[b.status] - statusPriority[a.status];
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });

    // Cache the result
    cache.set(cacheKey, projects, CACHE_TTL.AIRDROPS_LIST);

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch airdrops',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

