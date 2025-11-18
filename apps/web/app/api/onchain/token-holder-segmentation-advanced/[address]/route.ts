import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-segmentation-advanced/[address]
 * Advanced holder segmentation analysis
 * Categorizes holders by behavior and value
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-holder-seg:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const segmentation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      segments: {
        whales: 0,
        dolphins: 0,
        fish: 0,
        minnows: 0,
      },
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 1000 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const values = holders.map((h: any) => parseFloat(h.value || '0')).sort((a, b) => b - a);
        
        if (values.length > 0) {
          const totalValue = values.reduce((a, b) => a + b, 0);
          const whaleThreshold = totalValue * 0.1;
          const dolphinThreshold = totalValue * 0.01;
          const fishThreshold = totalValue * 0.001;
          
          holders.forEach((h: any) => {
            const value = parseFloat(h.value || '0');
            if (value >= whaleThreshold) segmentation.segments.whales++;
            else if (value >= dolphinThreshold) segmentation.segments.dolphins++;
            else if (value >= fishThreshold) segmentation.segments.fish++;
            else segmentation.segments.minnows++;
          });
        }
      }
    } catch (error) {
      console.error('Error segmenting holders:', error);
    }

    cache.set(cacheKey, segmentation, 15 * 60 * 1000);

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

