import { NextRequest, NextResponse } from 'next/server';
import {
  cache,
  CACHE_TTL,
  type TrendingProjectSummary,
  type AirdropStatus,
} from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { calculateTrendingProjects } from '@/lib/analyzers/trending-airdrops';

export const dynamic = 'force-dynamic';

/**
 * GET /api/airdrops/trending
 * Returns trending airdrop projects with a heuristic score
 * Query params:
 *  - limit: number of projects to return (default 5, max 10)
 *  - status: comma separated list of statuses (confirmed, rumored, speculative, expired)
 *  - chain: optional chain name filter (e.g. "Ethereum")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const statusParam = searchParams.get('status');
    const chainParam = searchParams.get('chain');

    const limit = Math.min(
      Math.max(parseInt(limitParam ?? '5', 10), 1),
      10
    );

    const statusFilters = statusParam
      ? statusParam
          .split(',')
          .map((status) => status.trim())
          .filter(Boolean) as AirdropStatus[]
      : undefined;

    const cacheKeyParts = [
      'airdrops:trending',
      `limit:${limit}`,
      statusFilters ? `status:${statusFilters.sort().join('.')}` : null,
      chainParam ? `chain:${chainParam.toLowerCase()}` : null,
    ].filter(Boolean);

    const cacheKey = cacheKeyParts.join('|');
    const cached = cache.get<TrendingProjectSummary[]>(cacheKey);

    if (cached) {
      return NextResponse.json({
        trending: cached,
        cached: true,
        generatedAt: new Date().toISOString(),
      });
    }

    const projects = await findAllProjects();
    const trending = calculateTrendingProjects(projects, {
      limit,
      status: statusFilters,
      chain: chainParam,
    });

    cache.set(cacheKey, trending, CACHE_TTL.AIRDROP_TRENDING);

    return NextResponse.json({
      trending,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trending airdrops API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute trending airdrops',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



