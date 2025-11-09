import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/opportunities/[address]
 * Find best airdrop opportunities based on current eligibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch user activity
    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    // Fetch all projects
    const projects = await findAllProjects();

    // Analyze opportunities
    const opportunities = projects
      .filter((p) => p.status === 'confirmed' || p.status === 'rumored')
      .map((project) => {
        const criteriaResults = project.criteria?.map((criterion) => ({
          description: criterion.description || '',
          met: checkCriteria(criterion, userActivity),
        })) || [];

        const currentScore = criteriaResults.length > 0
          ? Math.round((criteriaResults.filter((c) => c.met).length / criteriaResults.length) * 100)
          : 0;

        // Calculate effort needed (missing criteria)
        const missingCriteria = criteriaResults.filter((c) => !c.met);
        const effortScore = missingCriteria.length;

        // Calculate opportunity score
        let opportunityScore = currentScore;
        
        // Boost for confirmed status
        if (project.status === 'confirmed') opportunityScore += 20;
        
        // Boost for upcoming snapshot
        if (project.snapshotDate) {
          const snapshotDate = new Date(project.snapshotDate);
          const now = new Date();
          if (snapshotDate > now) {
            const daysUntil = Math.ceil((snapshotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 30) opportunityScore += 30;
            else if (daysUntil <= 90) opportunityScore += 20;
          }
        }

        // Boost for estimated value
        if (project.estimatedValue) opportunityScore += 15;

        // Penalize high effort
        opportunityScore -= effortScore * 5;

        return {
          projectId: project.projectId,
          name: project.name,
          slug: project.slug,
          status: project.status,
          currentScore,
          opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
          effortNeeded: effortScore,
          missingCriteria: missingCriteria.map((c) => c.description),
          estimatedValue: project.estimatedValue,
          snapshotDate: project.snapshotDate,
          claimUrl: project.claimUrl,
          chains: project.chains || [],
        };
      })
      .filter((opp) => opp.currentScore < 100) // Only show incomplete opportunities
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 20);

    // Categorize opportunities
    const easyWins = opportunities.filter((opp) => opp.effortNeeded <= 2 && opp.currentScore >= 50);
    const highValue = opportunities.filter((opp) => opp.estimatedValue && opp.currentScore >= 30);
    const quickActions = opportunities.filter((opp) => {
      if (!opp.snapshotDate) return false;
      const snapshotDate = new Date(opp.snapshotDate);
      const now = new Date();
      const daysUntil = Math.ceil((snapshotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && opp.currentScore >= 40;
    });

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      opportunities,
      categories: {
        easyWins: easyWins.slice(0, 5),
        highValue: highValue.slice(0, 5),
        quickActions: quickActions.slice(0, 5),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find opportunities',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

