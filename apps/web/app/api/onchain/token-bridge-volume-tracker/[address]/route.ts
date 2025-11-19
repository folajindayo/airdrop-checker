import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-volume-tracker/[address]
 * Track bridge transaction volumes across chains
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
    const cacheKey = `onchain-bridge-volume:${normalizedAddress}:${chainId || 'all'}`;
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
      totalBridgeVolume: 0,
      bridgeTxCount: 0,
      avgBridgeSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const bridgeTxs = response.data.items.filter((tx: any) => 
          tx.to_address && ['bridge', 'stargate', 'hop', 'across'].some(b => 
            tx.to_address.toLowerCase().includes(b)
          )
        );
        
        tracking.bridgeTxCount = bridgeTxs.length;
        
        if (bridgeTxs.length > 0) {
          const volumes = bridgeTxs.map((tx: any) => 
            parseFloat(tx.value_quote || '0')
          );
          tracking.totalBridgeVolume = volumes.reduce((a, b) => a + b, 0);
          tracking.avgBridgeSize = tracking.totalBridgeVolume / bridgeTxs.length;
        }
      }
    } catch (error) {
      console.error('Error tracking bridge volume:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Bridge volume tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track bridge volume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






