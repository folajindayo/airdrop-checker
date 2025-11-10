import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/visualization/[address]
 * Get data formatted for visualization (charts, graphs, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch data
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

    const visualization: Record<string, any> = {};

    // Score distribution chart data
    if (type === 'all' || type === 'scores') {
      const eligibility = projects.map((project) => {
        const criteriaResults = project.criteria?.map((criterion) =>
          checkCriteria(criterion, userActivity)
        ) || [];
        const score = criteriaResults.length > 0
          ? Math.round((criteriaResults.filter((c) => c).length / criteriaResults.length) * 100)
          : 0;
        return { project: project.name, score, status: project.status };
      });

      visualization.scoreDistribution = {
        labels: eligibility.map((e) => e.project),
        datasets: [
          {
            label: 'Eligibility Score',
            data: eligibility.map((e) => e.score),
            backgroundColor: eligibility.map((e) =>
              e.score >= 80 ? '#22c55e' : e.score >= 50 ? '#eab308' : '#ef4444'
            ),
          },
        ],
      };

      visualization.scoreByStatus = {
        confirmed: eligibility.filter((e) => e.status === 'confirmed').map((e) => e.score),
        rumored: eligibility.filter((e) => e.status === 'rumored').map((e) => e.score),
        speculative: eligibility.filter((e) => e.status === 'speculative').map((e) => e.score),
      };
    }

    // Activity timeline data
    if (type === 'all' || type === 'timeline') {
      const timelineData: Record<string, number> = {};
      Object.values(chainTransactions).forEach((txs) => {
        txs.forEach((tx: any) => {
          const date = new Date(tx.block_signed_at).toISOString().split('T')[0];
          timelineData[date] = (timelineData[date] || 0) + 1;
        });
      });

      visualization.activityTimeline = {
        labels: Object.keys(timelineData).sort(),
        data: Object.keys(timelineData)
          .sort()
          .map((date) => timelineData[date]),
      };
    }

    // Chain distribution
    if (type === 'all' || type === 'chains') {
      const chainDistribution: Record<string, number> = {};
      Object.entries(chainTransactions).forEach(([chainId, txs]) => {
        const chainName = chainId; // Would map to actual chain name
        chainDistribution[chainName] = txs.length;
      });

      visualization.chainDistribution = {
        labels: Object.keys(chainDistribution),
        data: Object.values(chainDistribution),
      };
    }

    // Protocol activity
    if (type === 'all' || type === 'protocols') {
      const protocolActivity: Record<string, number> = {};
      
      if (userActivity.swaps) {
        Object.entries(userActivity.swaps).forEach(([protocol, count]) => {
          protocolActivity[protocol] = (protocolActivity[protocol] || 0) + count;
        });
      }

      if (userActivity.nftPlatforms) {
        Object.entries(userActivity.nftPlatforms).forEach(([platform, count]) => {
          protocolActivity[platform] = (protocolActivity[platform] || 0) + count;
        });
      }

      visualization.protocolActivity = {
        labels: Object.keys(protocolActivity),
        data: Object.values(protocolActivity),
      };
    }

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      visualization,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Visualization API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate visualization data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

