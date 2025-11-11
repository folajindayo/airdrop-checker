import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/excel/[address]
 * Export eligibility data to Excel format
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

    // Fetch eligibility data
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
        Project: project.name,
        'Project ID': project.projectId,
        Status: project.status,
        Score: score,
        Chains: (project.chains || []).join(', '),
        'Criteria Met': criteriaResults.filter((c) => c.met).length,
        'Total Criteria': criteriaResults.length,
        'Snapshot Date': project.snapshotDate || 'N/A',
        'Claim URL': project.claimUrl || 'N/A',
        'Estimated Value': project.estimatedValue || 'N/A',
      };
    });

    // Generate Excel-compatible CSV (can be opened in Excel)
    const headers = Object.keys(eligibility[0] || {});
    const csvRows = [
      headers.join('\t'), // Tab-separated for Excel
      ...eligibility.map((row) =>
        headers.map((header) => String(row[header as keyof typeof row] || '')).join('\t')
      ),
    ];

    const csv = csvRows.join('\n');

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF';
    const excelContent = bom + csv;

    return new NextResponse(excelContent, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="airdrop-eligibility-${normalizedAddress.slice(0, 8)}.xls"`,
      },
    });
  } catch (error) {
    console.error('Excel export API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export Excel file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



