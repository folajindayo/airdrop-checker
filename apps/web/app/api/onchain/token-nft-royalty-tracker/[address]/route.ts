import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-nft-royalty-tracker/[address]
 * Track NFT royalty earnings and payments
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
    const cacheKey = `onchain-nft-royalty:${normalizedAddress}:${chainId || 'all'}`;
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
      totalRoyalties: 0,
      royaltyRate: 0.05,
      payments: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const royaltyTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('royalty')
          )
        );
        
        tracking.payments = royaltyTxs.map((tx: any) => ({
          amount: tx.value_quote || '0',
          date: tx.block_signed_at,
        }));
        
        tracking.totalRoyalties = royaltyTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.value_quote || '0'), 0
        );
      }
    } catch (error) {
      console.error('Error tracking NFT royalties:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('NFT royalty tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track NFT royalties',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





