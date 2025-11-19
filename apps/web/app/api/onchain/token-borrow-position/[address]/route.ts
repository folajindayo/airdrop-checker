import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-borrow-position/[address]
 * Track borrowing positions and debt across protocols
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
    const cacheKey = `onchain-borrow-position:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const position: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      borrowPositions: [],
      totalDebt: 0,
      healthFactor: 1.0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const borrowTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('borrow')
          )
        );
        
        position.borrowPositions = borrowTxs.map((tx: any) => ({
          protocol: tx.to_address,
          amount: tx.value_quote || '0',
        }));
      }
    } catch (error) {
      console.error('Error tracking borrow positions:', error);
    }

    cache.set(cacheKey, position, 5 * 60 * 1000);

    return NextResponse.json(position);
  } catch (error) {
    console.error('Borrow position tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track borrow positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





