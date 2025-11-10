import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/[address]
 * Mobile-optimized lightweight API endpoint
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

    // Fetch minimal data for mobile
    const [chainTransactions, chainNFTs, projects] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
      findAllProjects(),
    ]);

    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    // Calculate only essential eligibility scores
    const eligibility = projects
      .filter((p) => p.status === 'confirmed' || p.status === 'rumored')
      .slice(0, 20) // Limit for mobile
      .map((project) => {
        const criteriaResults = project.criteria?.map((criterion) =>
          checkCriteria(criterion, userActivity)
        ) || [];
        const score = criteriaResults.length > 0
          ? Math.round((criteriaResults.filter((c) => c).length / criteriaResults.length) * 100)
          : 0;

        return {
          id: project.projectId,
          name: project.name,
          score,
          status: project.status,
        };
      })
      .sort((a, b) => b.score - a.score);

    const overallScore = eligibility.length > 0
      ? Math.round(eligibility.reduce((sum, e) => sum + e.score, 0) / eligibility.length)
      : 0;

    // Minimal stats
    const stats = {
      overallScore,
      eligibleCount: eligibility.filter((e) => e.score >= 50).length,
      totalChecked: eligibility.length,
      chainsUsed: Object.keys(chainTransactions).length,
      totalTxs: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
    };

    return NextResponse.json({
      address: normalizedAddress,
      stats,
      topAirdrops: eligibility.slice(0, 10),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Mobile API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch mobile data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

