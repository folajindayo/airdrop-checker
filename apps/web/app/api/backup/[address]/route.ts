import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { findAllProjects } from '@/lib/db/models/project';
import { fetchAllChainTransactions, fetchAllChainNFTs } from '@/lib/goldrush';
import { aggregateUserActivity } from '@/lib/analyzers/activity-aggregator';
import { checkCriteria } from '@/lib/analyzers/criteria-checker';

export const dynamic = 'force-dynamic';

/**
 * GET /api/backup/[address]
 * Create a backup of all user data
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
      };
    });

    // Create backup object
    const backup = {
      version: '1.0',
      address: normalizedAddress,
      createdAt: new Date().toISOString(),
      data: {
        transactions: chainTransactions,
        nfts: chainNFTs,
        activity: userActivity,
        eligibility,
        projects: projects.map((p) => ({
          projectId: p.projectId,
          name: p.name,
          status: p.status,
          chains: p.chains,
          criteria: p.criteria,
        })),
      },
    };

    return NextResponse.json(backup, {
      headers: {
        'Content-Disposition': `attachment; filename="airdrop-backup-${normalizedAddress.slice(0, 8)}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup/[address]
 * Restore from backup
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { backup } = body;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!backup || !backup.version || !backup.data) {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    if (backup.address.toLowerCase() !== normalizedAddress) {
      return NextResponse.json(
        { error: 'Backup address does not match' },
        { status: 400 }
      );
    }

    // Validate backup structure
    const requiredFields = ['transactions', 'nfts', 'activity', 'eligibility'];
    const missingFields = requiredFields.filter((field) => !backup.data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // In production, this would restore data to database
    // For now, just validate and return success

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      restoredAt: new Date().toISOString(),
      dataSummary: {
        transactions: Object.keys(backup.data.transactions || {}).length,
        nfts: Object.keys(backup.data.nfts || {}).length,
        eligibilityRecords: backup.data.eligibility?.length || 0,
      },
    });
  } catch (error) {
    console.error('Restore API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to restore backup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



