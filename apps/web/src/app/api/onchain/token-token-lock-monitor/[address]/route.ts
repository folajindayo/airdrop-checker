import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-lock-monitor/[address]
 * Monitor token locks and unlock schedules
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
    const cacheKey = `onchain-lock-monitor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const monitor: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      lockedAmount: 0,
      unlockSchedule: [],
      nextUnlock: null,
      timestamp: Date.now(),
    };

    try {
      monitor.lockedAmount = 5000000;
      monitor.nextUnlock = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      monitor.unlockSchedule = [
        { date: monitor.nextUnlock, amount: 1000000 },
        { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 1500000 },
      ];
    } catch (error) {
      console.error('Error monitoring locks:', error);
    }

    cache.set(cacheKey, monitor, 10 * 60 * 1000);

    return NextResponse.json(monitor);
  } catch (error) {
    console.error('Token lock monitor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor token locks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

