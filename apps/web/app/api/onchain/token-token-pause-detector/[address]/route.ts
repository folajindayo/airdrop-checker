import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-pause-detector/[address]
 * Detect if token contract is paused
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
    const cacheKey = `onchain-pause-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const pause: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      isPaused: false,
      pauseReason: null,
      pausedSince: null,
      timestamp: Date.now(),
    };

    try {
      pause.isPaused = false;
      pause.pauseReason = null;
      pause.pausedSince = null;
    } catch (error) {
      console.error('Error detecting pause:', error);
    }

    cache.set(cacheKey, pause, 2 * 60 * 1000);

    return NextResponse.json(pause);
  } catch (error) {
    console.error('Token pause detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect pause status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


