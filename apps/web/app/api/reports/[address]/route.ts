import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/[address]
 * Generate comprehensive report for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const includeCharts = searchParams.get('includeCharts') === 'true';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch all data
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

    // Calculate eligibility
    const eligibility = projects.map((project) => {
      const criteriaResults = project.criteria?.map((criterion) => ({
        description: criterion.description || '',
        met: checkCriteria(criterion, userActivity),
      })) || [];

      const score = criteriaResults.length > 0
        ? Math.round((criteriaResults.filter((c) => c.met).length / criteriaResults.length) * 100)
        : 0;

      return {
        projectId: project.projectId,
        name: project.name,
        status: project.status,
        score,
        criteria: criteriaResults,
        chains: project.chains || [],
        estimatedValue: project.estimatedValue,
        snapshotDate: project.snapshotDate,
        claimUrl: project.claimUrl,
      };
    });

    const overallScore = eligibility.length > 0
      ? Math.round(eligibility.reduce((sum, e) => sum + e.score, 0) / eligibility.length)
      : 0;

    // Calculate statistics
    const stats = {
      totalProjects: eligibility.length,
      eligibleProjects: eligibility.filter((e) => e.score >= 50).length,
      confirmedProjects: eligibility.filter((e) => e.status === 'confirmed').length,
      rumoredProjects: eligibility.filter((e) => e.status === 'rumored').length,
      averageScore: overallScore,
      topScore: Math.max(...eligibility.map((e) => e.score), 0),
      chainsUsed: Object.keys(chainTransactions).length,
      totalTransactions: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
      totalNFTs: Object.values(chainNFTs).reduce((sum, nfts) => sum + nfts.length, 0),
    };

    // Generate report
    const report = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      address: normalizedAddress,
      summary: {
        overallScore,
        stats,
      },
      eligibility,
      activity: {
        transactions: Object.keys(chainTransactions).map((chainId) => ({
          chainId: parseInt(chainId, 10),
          count: chainTransactions[parseInt(chainId, 10)].length,
        })),
        nfts: Object.keys(chainNFTs).map((chainId) => ({
          chainId: parseInt(chainId, 10),
          count: chainNFTs[parseInt(chainId, 10)].length,
        })),
        protocols: userActivity,
      },
      recommendations: generateRecommendations(eligibility, userActivity),
    };

    if (format === 'pdf') {
      // In production, generate PDF using a library like pdfkit or puppeteer
      return NextResponse.json(
        { error: 'PDF format not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json(report, {
      headers: {
        'Content-Disposition': `attachment; filename="airdrop-report-${normalizedAddress.slice(0, 8)}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(eligibility: any[], activity: any): string[] {
  const recommendations: string[] = [];

  // Low score recommendations
  const lowScoreProjects = eligibility.filter((e) => e.score < 50);
  if (lowScoreProjects.length > 0) {
    recommendations.push(`Focus on ${lowScoreProjects.length} projects with scores below 50%`);
  }

  // Missing criteria recommendations
  const missingCriteria = eligibility
    .filter((e) => e.score < 100)
    .flatMap((e) => e.criteria.filter((c: any) => !c.met).map((c: any) => c.description))
    .slice(0, 5);

  if (missingCriteria.length > 0) {
    recommendations.push(`Consider: ${missingCriteria.join(', ')}`);
  }

  // Chain diversification
  const chainsUsed = Object.keys(activity.chains || {}).length;
  if (chainsUsed < 3) {
    recommendations.push('Try interacting with more chains to increase eligibility');
  }

  return recommendations;
}

