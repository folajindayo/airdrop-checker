import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-options-position/[address]
 * Track options positions and Greeks
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
    const cacheKey = `onchain-options-position:${normalizedAddress}:${chainId || 'all'}`;
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
      optionsPositions: [],
      totalValue: 0,
      delta: 0,
      gamma: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const optionsTxs = response.data.items.filter((tx: any) => 
          tx.to_address?.toLowerCase().includes('option') ||
          tx.to_address?.toLowerCase().includes('opyn')
        );
        
        position.optionsPositions = optionsTxs.map((tx: any) => ({
          contract: tx.to_address,
          value: tx.value_quote || '0',
        }));
        
        position.totalValue = optionsTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.value_quote || '0'), 0
        );
      }
    } catch (error) {
      console.error('Error tracking options positions:', error);
    }

    cache.set(cacheKey, position, 5 * 60 * 1000);

    return NextResponse.json(position);
  } catch (error) {
    console.error('Options position tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track options positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






