import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ClaimEntry {
  id: string;
  address: string;
  projectId: string;
  projectName: string;
  status: 'claimed' | 'pending' | 'failed';
  amount: string;
  valueUSD: number;
  txHash?: string;
  claimedAt?: string;
  notes?: string;
}

// In-memory storage (in production, use database)
const claimsStore = new Map<string, ClaimEntry[]>();

/**
 * POST /api/claim-tracker
 * Add a new airdrop claim entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      projectId,
      projectName,
      status,
      amount,
      valueUSD,
      txHash,
      notes,
    } = body;

    if (!address || !projectId || !projectName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address, projectId, and projectName are required',
        },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const validStatuses = ['claimed', 'pending', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const id = `claim-${normalizedAddress}-${Date.now()}`;
    const claim: ClaimEntry = {
      id,
      address: normalizedAddress,
      projectId,
      projectName,
      status: status as 'claimed' | 'pending' | 'failed',
      amount: amount || '0',
      valueUSD: valueUSD || 0,
      txHash,
      claimedAt: status === 'claimed' ? new Date().toISOString() : undefined,
      notes,
    };

    const claims = claimsStore.get(normalizedAddress) || [];
    claims.push(claim);
    claimsStore.set(normalizedAddress, claims);

    return NextResponse.json({
      success: true,
      claim,
      message: 'Claim entry added successfully',
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add claim entry',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claim-tracker
 * Get all claims for an address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const status = searchParams.get('status');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let claims = claimsStore.get(normalizedAddress) || [];

    // Filter by status if provided
    if (status) {
      claims = claims.filter((c) => c.status === status);
    }

    // Sort by claimedAt (most recent first)
    claims.sort((a, b) => {
      const dateA = a.claimedAt ? new Date(a.claimedAt).getTime() : 0;
      const dateB = b.claimedAt ? new Date(b.claimedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Calculate statistics
    const stats = {
      total: claims.length,
      claimed: claims.filter((c) => c.status === 'claimed').length,
      pending: claims.filter((c) => c.status === 'pending').length,
      failed: claims.filter((c) => c.status === 'failed').length,
      totalValueUSD: claims
        .filter((c) => c.status === 'claimed')
        .reduce((sum, c) => sum + c.valueUSD, 0),
    };

    return NextResponse.json({
      success: true,
      claims,
      stats,
      count: claims.length,
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch claims',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/claim-tracker
 * Update a claim entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, address, status, txHash, notes, valueUSD } = body;

    if (!id || !address) {
      return NextResponse.json(
        { success: false, error: 'ID and address are required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const claims = claimsStore.get(normalizedAddress) || [];
    const claimIndex = claims.findIndex((c) => c.id === id);

    if (claimIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    const claim = claims[claimIndex];

    // Update fields
    if (status) {
      claim.status = status as 'claimed' | 'pending' | 'failed';
      if (status === 'claimed' && !claim.claimedAt) {
        claim.claimedAt = new Date().toISOString();
      }
    }
    if (txHash !== undefined) claim.txHash = txHash;
    if (notes !== undefined) claim.notes = notes;
    if (valueUSD !== undefined) claim.valueUSD = valueUSD;

    claims[claimIndex] = claim;
    claimsStore.set(normalizedAddress, claims);

    return NextResponse.json({
      success: true,
      claim,
      message: 'Claim updated successfully',
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update claim',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/claim-tracker
 * Delete a claim entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const address = searchParams.get('address');

    if (!id || !address) {
      return NextResponse.json(
        { success: false, error: 'ID and address are required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const claims = claimsStore.get(normalizedAddress) || [];
    const filteredClaims = claims.filter((c) => c.id !== id);

    if (filteredClaims.length === claims.length) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    claimsStore.set(normalizedAddress, filteredClaims);

    return NextResponse.json({
      success: true,
      message: 'Claim deleted successfully',
    });
  } catch (error) {
    console.error('Claim tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete claim',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



