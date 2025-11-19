import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-nft-floor-price/[address]
 * Track NFT collection floor prices and trends
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
    const cacheKey = `onchain-nft-floor-price:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      floorPrice: 0,
      collectionValue: 0,
      nftCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/nft/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const nfts = response.data.items;
        tracking.nftCount = nfts.length;
        
        if (nfts.length > 0) {
          const prices = nfts
            .map((nft: any) => parseFloat(nft.nft_data?.[0]?.external_data?.floor_price || '0'))
            .filter((p: number) => p > 0);
          
          tracking.floorPrice = prices.length > 0 ? Math.min(...prices) : 0;
          tracking.collectionValue = prices.reduce((sum: number, p: number) => sum + p, 0);
        }
      }
    } catch (error) {
      console.error('Error tracking NFT floor price:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('NFT floor price tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track NFT floor prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





