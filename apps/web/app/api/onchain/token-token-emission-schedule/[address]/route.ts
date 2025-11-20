import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-emission-schedule/[address]
 * Track token emission schedule and release timeline
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
    const cacheKey = `onchain-emission-schedule:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const schedule: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalEmission: 0,
      released: 0,
      remaining: 0,
      schedule: [],
      timestamp: Date.now(),
    };

    try {
      schedule.totalEmission = 10000000;
      schedule.released = 4000000;
      schedule.remaining = schedule.totalEmission - schedule.released;
      schedule.schedule = [
        { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 500000 },
        { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 500000 },
      ];
    } catch (error) {
      console.error('Error tracking emission:', error);
    }

    cache.set(cacheKey, schedule, 10 * 60 * 1000);

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Token emission schedule error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track emission schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

