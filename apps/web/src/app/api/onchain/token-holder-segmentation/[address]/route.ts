import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-segmentation/[address]
 * Segment holders by behavior and value
 * Categorizes holder types
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
    const cacheKey = `onchain-holder-segmentation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const segmentation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      segments: {
        whales: 0,
        dolphins: 0,
        fish: 0,
        shrimp: 0,
      },
      totalHolders: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        segmentation.totalHolders = holders.length;
        
        const totalValue = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.quote || '0'), 0);

        holders.forEach((holder: any) => {
          const value = parseFloat(holder.quote || '0');
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
          
          if (percentage > 1) segmentation.segments.whales++;
          else if (percentage > 0.1) segmentation.segments.dolphins++;
          else if (percentage > 0.01) segmentation.segments.fish++;
          else segmentation.segments.shrimp++;
        });
      }
    } catch (error) {
      console.error('Error segmenting holders:', error);
    }

    cache.set(cacheKey, segmentation, 5 * 60 * 1000);

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

