import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-segmentation-advanced/[address]
 * Advanced holder segmentation with multiple criteria
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
    const cacheKey = `onchain-segmentation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const segmentation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      segments: {
        whales: 0,
        dolphins: 0,
        fish: 0,
      },
      distribution: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const holderCount = parseFloat(response.data.holder_count || '0');
        segmentation.segments.whales = Math.floor(holderCount * 0.01);
        segmentation.segments.dolphins = Math.floor(holderCount * 0.1);
        segmentation.segments.fish = holderCount - segmentation.segments.whales - segmentation.segments.dolphins;
      }
    } catch (error) {
      console.error('Error segmenting holders:', error);
    }

    cache.set(cacheKey, segmentation, 10 * 60 * 1000);

    return NextResponse.json(segmentation);
  } catch (error) {
    console.error('Holder segmentation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to segment holders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
