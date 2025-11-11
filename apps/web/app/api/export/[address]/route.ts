import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/[address]
 * Export eligibility data in various formats (JSON, CSV, PDF)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    // Fetch eligibility data
    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    const userActivity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    const projects = await findAllProjects();

    const results = projects.map((project) => {
      const criteriaResults = project.criteria?.map((criterion) => ({
        description: criterion.description || '',
        met: checkCriteria(criterion, userActivity),
      })) || [];

      const score = criteriaResults.length > 0
        ? Math.round((criteriaResults.filter((c) => c.met).length / criteriaResults.length) * 100)
        : 0;

      return {
        project: project.name,
        projectId: project.projectId,
        status: project.status,
        score,
        criteria: criteriaResults,
        chains: project.chains || [],
        snapshotDate: project.snapshotDate,
        claimUrl: project.claimUrl,
        estimatedValue: project.estimatedValue,
      };
    });

    const overallScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;

    const exportData = {
      address: normalizedAddress,
      overallScore,
      generatedAt: new Date().toISOString(),
      totalProjects: results.length,
      eligibleProjects: results.filter((r) => r.score >= 50).length,
      airdrops: results,
      activity: {
        totalTransactions: Object.values(chainTransactions).reduce((sum, txs) => sum + txs.length, 0),
        totalNFTs: Object.values(chainNFTs).reduce((sum, nfts) => sum + nfts.length, 0),
        chainsUsed: Object.keys(chainTransactions).length,
      },
    };

    if (format === 'csv') {
      // Generate CSV
      const csvRows = [
        ['Project', 'Status', 'Score', 'Chains', 'Snapshot Date', 'Estimated Value'],
        ...results.map((r) => [
          r.project,
          r.status,
          r.score.toString(),
          (r.chains || []).join(', '),
          r.snapshotDate || 'N/A',
          r.estimatedValue || 'N/A',
        ]),
      ];

      const csv = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="airdrop-eligibility-${normalizedAddress.slice(0, 8)}.csv"`,
        },
      });
    }

    if (format === 'txt') {
      // Generate plain text report
      const text = `
Airdrop Eligibility Report
Generated: ${new Date().toLocaleString()}
Address: ${normalizedAddress}
Overall Score: ${overallScore}%

Total Projects: ${results.length}
Eligible Projects: ${results.filter((r) => r.score >= 50).length}

${results.map((r) => `
${r.project} (${r.status})
  Score: ${r.score}%
  Chains: ${(r.chains || []).join(', ')}
  ${r.snapshotDate ? `Snapshot: ${r.snapshotDate}` : ''}
  ${r.estimatedValue ? `Est. Value: ${r.estimatedValue}` : ''}
  Criteria Met: ${r.criteria.filter((c) => c.met).length}/${r.criteria.length}
`).join('\n')}
      `.trim();

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="airdrop-report-${normalizedAddress.slice(0, 8)}.txt"`,
        },
      });
    }

    // Default: JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="airdrop-eligibility-${normalizedAddress.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



