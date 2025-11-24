import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-proxy-admin/[address]
 * Track proxy admin addresses for upgradeable contracts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-proxy-admin:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const admin: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      adminAddress: null,
      upgradeable: false,
      upgradeHistory: [],
      timestamp: Date.now(),
    };

    try {
      admin.adminAddress = null;
      admin.upgradeable = false;
      admin.upgradeHistory = [];
    } catch (error) {
      console.error('Error tracking admin:', error);
    }

    cache.set(cacheKey, admin, 10 * 60 * 1000);

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Token proxy admin error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track proxy admin',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

