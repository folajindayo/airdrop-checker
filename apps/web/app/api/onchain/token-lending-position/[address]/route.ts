import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-lending-position/[address]
 * Track lending positions across DeFi protocols
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
    const cacheKey = `onchain-lending-position:${normalizedAddress}:${chainId || 'all'}`;
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
      lendingPositions: [],
      totalSupplied: 0,
      totalBorrowed: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const lendingProtocols = ['Aave', 'Compound', 'Maker'];
        const positions: any[] = [];
        
        lendingProtocols.forEach(protocol => {
          const txs = response.data.items.filter((tx: any) => 
            tx.to_address?.toLowerCase().includes(protocol.toLowerCase())
          );
          if (txs.length > 0) {
            positions.push({ protocol, txCount: txs.length });
          }
        });
        
        position.lendingPositions = positions;
      }
    } catch (error) {
      console.error('Error tracking lending positions:', error);
    }

    cache.set(cacheKey, position, 5 * 60 * 1000);

    return NextResponse.json(position);
  } catch (error) {
    console.error('Lending position tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track lending positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





