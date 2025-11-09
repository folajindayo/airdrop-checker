import { NextResponse } from 'next/server';
import { cache, CACHE_TTL } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { buildAirdropHighlights, type AirdropHighlights } from '@/lib/analyzers/airdrop-highlights';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'airdrops:highlights';

export async function GET() {
  try {
    const cached = cache.get<AirdropHighlights>(CACHE_KEY);

    if (cached) {
      return NextResponse.json({
        highlights: cached,
        cached: true,
      });
    }

    const projects = await findAllProjects();
    const highlights = buildAirdropHighlights(projects);

    cache.set(CACHE_KEY, highlights, CACHE_TTL.AIRDROP_TRENDING);

    return NextResponse.json({
      highlights,
      cached: false,
    });
  } catch (error) {
    console.error('Airdrop highlights API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute airdrop highlights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

