import { NextRequest, NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

export const dynamic = 'force-dynamic';

/**
 * GET /api/predict
 * Predict likely airdrops based on patterns and trends
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30'; // days

    const projects = await findAllProjects();

    // Analyze patterns to predict likely airdrops
    const predictions = projects
      .filter((p) => p.status === 'rumored' || p.status === 'speculative')
      .map((project) => {
        let predictionScore = 0;
        const factors: string[] = [];

        // Criteria count (more criteria = more likely)
        const criteriaCount = Array.isArray(project.criteria) ? project.criteria.length : 0;
        if (criteriaCount > 0) {
          predictionScore += criteriaCount * 5;
          factors.push(`${criteriaCount} eligibility criteria defined`);
        }

        // Multi-chain support
        if (project.chains && project.chains.length > 1) {
          predictionScore += 15;
          factors.push('Multi-chain support');
        }

        // Has estimated value
        if (project.estimatedValue) {
          predictionScore += 20;
          factors.push('Estimated value provided');
        }

        // Recent updates
        if (project.updatedAt) {
          const daysSinceUpdate = Math.floor(
            (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceUpdate <= 30) {
            predictionScore += 25;
            factors.push('Recently updated');
          }
        }

        // Similar projects that confirmed
        const similarProjects = projects.filter(
          (p) =>
            p.status === 'confirmed' &&
            p.chains &&
            project.chains &&
            p.chains.some((c) => project.chains!.includes(c))
        );
        if (similarProjects.length > 0) {
          predictionScore += 10;
          factors.push('Similar projects have confirmed airdrops');
        }

        // Calculate probability
        const probability = Math.min(95, Math.max(5, predictionScore));

        // Estimate timeline
        let estimatedLaunch = null;
        if (project.snapshotDate) {
          estimatedLaunch = project.snapshotDate;
        } else {
          // Estimate based on score
          const daysFromNow = probability > 70 ? 30 : probability > 50 ? 60 : 90;
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + daysFromNow);
          estimatedLaunch = estimatedDate.toISOString().split('T')[0];
        }

        return {
          projectId: project.projectId,
          name: project.name,
          slug: project.slug,
          status: project.status,
          probability,
          factors,
          estimatedLaunch,
          chains: project.chains || [],
          estimatedValue: project.estimatedValue,
          criteriaCount,
        };
      })
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 20);

    // Filter by timeframe if specified
    const filteredPredictions = predictions.filter((p) => {
      if (!p.estimatedLaunch) return true;
      const launchDate = new Date(p.estimatedLaunch);
      const daysUntil = Math.ceil(
        (launchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= parseInt(timeframe, 10);
    });

    return NextResponse.json({
      success: true,
      predictions: filteredPredictions,
      timeframe: parseInt(timeframe, 10),
      totalAnalyzed: projects.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Predict API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

