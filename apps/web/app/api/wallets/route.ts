import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface Wallet {
  id: string;
  address: string;
  label?: string;
  createdAt: string;
  lastChecked?: string;
}

// In-memory storage (in production, use database)
const wallets: Map<string, Wallet[]> = new Map();

/**
 * GET /api/wallets
 * Get all wallets for a user (identified by session/address)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const userWallets = wallets.get(userId) || [];

    return NextResponse.json({
      success: true,
      wallets: userWallets,
      count: userWallets.length,
    });
  } catch (error) {
    console.error('Wallets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wallets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallets
 * Add a new wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, label, userId = 'default' } = body;

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Valid address required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const userWallets = wallets.get(userId) || [];

    // Check if wallet already exists
    if (userWallets.some((w) => w.address === normalizedAddress)) {
      return NextResponse.json(
        { error: 'Wallet already exists' },
        { status: 409 }
      );
    }

    // Limit to 10 wallets per user
    if (userWallets.length >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 wallets allowed' },
        { status: 400 }
      );
    }

    const wallet: Wallet = {
      id: `${userId}-${Date.now()}`,
      address: normalizedAddress,
      label: label || `Wallet ${userWallets.length + 1}`,
      createdAt: new Date().toISOString(),
    };

    userWallets.push(wallet);
    wallets.set(userId, userWallets);

    return NextResponse.json({
      success: true,
      wallet,
      message: 'Wallet added successfully',
    });
  } catch (error) {
    console.error('Wallets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wallets
 * Remove a wallet
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('id');
    const userId = searchParams.get('userId') || 'default';

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID required' },
        { status: 400 }
      );
    }

    const userWallets = wallets.get(userId) || [];
    const filtered = userWallets.filter((w) => w.id !== walletId);

    if (filtered.length === userWallets.length) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    wallets.set(userId, filtered);

    return NextResponse.json({
      success: true,
      message: 'Wallet removed successfully',
    });
  } catch (error) {
    console.error('Wallets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

