import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trending
 * Get trending airdrops based on various metrics
 */
export async function GET() {
  try {
    const projects = await findAllProjects();

    // Calculate trending score based on multiple factors
    const trending = projects
      .filter((p) => p.status === 'confirmed' || p.status === 'rumored')
      .map((project) => {
        let score = 0;

        // Status weight
        if (project.status === 'confirmed') score += 50;
        else if (project.status === 'rumored') score += 30;

        // Criteria count (more criteria = more interest)
        const criteriaCount = Array.isArray(project.criteria) ? project.criteria.length : 0;
        score += criteriaCount * 5;

        // Multi-chain bonus
        if (project.chains && project.chains.length > 1) {
          score += project.chains.length * 5;
        }

        // Has snapshot date (upcoming)
        if (project.snapshotDate) {
          const snapshotDate = new Date(project.snapshotDate);
          const now = new Date();
          if (snapshotDate > now) {
            const daysUntil = Math.ceil((snapshotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            // Closer snapshots get higher scores
            if (daysUntil <= 30) score += 30;
            else if (daysUntil <= 90) score += 20;
            else score += 10;
          }
        }

        // Has claim URL (active)
        if (project.claimUrl) score += 20;

        // Estimated value bonus
        if (project.estimatedValue) score += 15;

        return {
          projectId: project.projectId,
          name: project.name,
          slug: project.slug,
          status: project.status,
          score,
          chains: project.chains || [],
          criteriaCount,
          snapshotDate: project.snapshotDate,
          claimUrl: project.claimUrl,
          estimatedValue: project.estimatedValue,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      trending,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending airdrops',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

