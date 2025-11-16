import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-whale-alert/[address]
 * Monitor whale wallet movements
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
    const cacheKey = `onchain-whale-alert:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const whaleAlert: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      whaleCount: 0,
      totalWhaleBalance: 0,
      recentMovements: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const totalSupply = response.data.items.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        
        const whales = response.data.items.filter((h: any) => {
          const balance = parseFloat(h.balance || '0');
          return (balance / totalSupply) * 100 > 1;
        });

        whaleAlert.whaleCount = whales.length;
        whaleAlert.totalWhaleBalance = whales.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
      }
    } catch (error) {
      console.error('Error monitoring whales:', error);
    }

    cache.set(cacheKey, whaleAlert, 2 * 60 * 1000);

    return NextResponse.json(whaleAlert);
  } catch (error) {
    console.error('Whale alert error:', error);
    return NextResponse.json(
      {
        error: 'Failed to monitor whale movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

