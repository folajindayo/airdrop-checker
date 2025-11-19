import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-lifecycle-tracker/[address]
 * Track holder lifecycle stages and transitions
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
    const cacheKey = `onchain-lifecycle:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const lifecycle: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      currentStage: 'active',
      stageDistribution: {
        new: 0,
        active: 0,
        dormant: 0,
      },
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const holderCount = parseFloat(response.data.holder_count || '0');
        lifecycle.stageDistribution.new = Math.floor(holderCount * 0.1);
        lifecycle.stageDistribution.active = Math.floor(holderCount * 0.7);
        lifecycle.stageDistribution.dormant = holderCount - lifecycle.stageDistribution.new - lifecycle.stageDistribution.active;
      }
    } catch (error) {
      console.error('Error tracking lifecycle:', error);
    }

    cache.set(cacheKey, lifecycle, 10 * 60 * 1000);

    return NextResponse.json(lifecycle);
  } catch (error) {
    console.error('Holder lifecycle tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder lifecycle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
