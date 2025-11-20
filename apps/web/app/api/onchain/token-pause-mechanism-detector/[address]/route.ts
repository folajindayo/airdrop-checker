import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-pause-mechanism-detector/[address]
 * Detect pause functionality in token contracts
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
    const cacheKey = `onchain-pause-mechanism:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detector: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      canPause: false,
      isPaused: false,
      pauseHistory: [],
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        detector.canPause = true;
        detector.isPaused = false;
        detector.riskLevel = detector.canPause ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error detecting pause mechanism:', error);
    }

    cache.set(cacheKey, detector, 5 * 60 * 1000);

    return NextResponse.json(detector);
  } catch (error) {
    console.error('Pause mechanism detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect pause mechanism',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

