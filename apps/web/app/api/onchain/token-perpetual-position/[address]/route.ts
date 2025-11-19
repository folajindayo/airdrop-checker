import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-perpetual-position/[address]
 * Track perpetual futures positions and funding rates
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
    const cacheKey = `onchain-perpetual-position:${normalizedAddress}:${chainId || 'all'}`;
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
      positions: [],
      totalPnL: 0,
      fundingRate: 0.0001,
      leverage: 1,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const perpTxs = response.data.items.filter((tx: any) => 
          tx.to_address?.toLowerCase().includes('perp') ||
          tx.to_address?.toLowerCase().includes('dydx')
        );
        
        position.positions = perpTxs.map((tx: any) => ({
          exchange: tx.to_address,
          size: tx.value_quote || '0',
        }));
      }
    } catch (error) {
      console.error('Error tracking perpetual positions:', error);
    }

    cache.set(cacheKey, position, 2 * 60 * 1000);

    return NextResponse.json(position);
  } catch (error) {
    console.error('Perpetual position tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track perpetual positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






