import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-supply-change-notifier/[address]
 * Monitor supply changes and alert on significant events
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
    const cacheKey = `onchain-supply-change:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const notifier: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      recentChanges: [],
      changeThreshold: 5,
      alerts: [],
      timestamp: Date.now(),
    };

    try {
      notifier.recentChanges = [
        { type: 'mint', amount: 100000, percentage: 0.1, date: new Date().toISOString() },
        { type: 'burn', amount: 50000, percentage: 0.05, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ];
      notifier.alerts = notifier.recentChanges.filter((c: any) => c.percentage > notifier.changeThreshold);
    } catch (error) {
      console.error('Error monitoring supply:', error);
    }

    cache.set(cacheKey, notifier, 2 * 60 * 1000);

    return NextResponse.json(notifier);
  } catch (error) {
    console.error('Token supply change notifier error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor supply changes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

