import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface AirdropHistory {
  id: string;
  address: string;
  projectId: string;
  projectName: string;
  status: 'claimed' | 'eligible' | 'missed';
  claimedAt?: string;
  amount?: string;
  value?: number;
  txHash?: string;
  notes?: string;
}

// In-memory storage (in production, use database)
const history: Map<string, AirdropHistory[]> = new Map();

/**
 * GET /api/history/[address]
 * Get airdrop claim history for an address
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
    const addressHistory = history.get(normalizedAddress) || [];

    // Calculate statistics
    const stats = {
      total: addressHistory.length,
      claimed: addressHistory.filter((h) => h.status === 'claimed').length,
      eligible: addressHistory.filter((h) => h.status === 'eligible').length,
      missed: addressHistory.filter((h) => h.status === 'missed').length,
      totalValue: addressHistory
        .filter((h) => h.value)
        .reduce((sum, h) => sum + (h.value || 0), 0),
    };

    return NextResponse.json({
      success: true,
      history: addressHistory.sort((a, b) => {
        const dateA = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
        const dateB = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
        return dateB - dateA;
      }),
      stats,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history/[address]
 * Add an entry to airdrop history
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    const { projectId, projectName, status, amount, value, txHash, notes } = body;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!projectId || !status) {
      return NextResponse.json(
        { error: 'projectId and status are required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const addressHistory = history.get(normalizedAddress) || [];

    const entry: AirdropHistory = {
      id: `${normalizedAddress}-${projectId}-${Date.now()}`,
      address: normalizedAddress,
      projectId,
      projectName: projectName || projectId,
      status,
      amount,
      value,
      txHash,
      notes,
      claimedAt: status === 'claimed' ? new Date().toISOString() : undefined,
    };

    addressHistory.push(entry);
    history.set(normalizedAddress, addressHistory);

    return NextResponse.json({
      success: true,
      entry,
      message: 'History entry added successfully',
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add history entry',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

