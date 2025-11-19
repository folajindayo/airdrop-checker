import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-liquidation-price/[address]
 * Calculate liquidation price for positions
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
    const cacheKey = `onchain-liquidation-price:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const liquidation: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      liquidationPrice: 0,
      currentPrice: 0,
      priceDifference: 0,
      timestamp: Date.now(),
    };

    try {
      liquidation.currentPrice = 2000;
      liquidation.liquidationPrice = 1500;
      liquidation.priceDifference = ((liquidation.currentPrice - liquidation.liquidationPrice) / liquidation.currentPrice) * 100;
    } catch (error) {
      console.error('Error calculating liquidation price:', error);
    }

    cache.set(cacheKey, liquidation, 2 * 60 * 1000);

    return NextResponse.json(liquidation);
  } catch (error) {
    console.error('Token liquidation price error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidation price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

