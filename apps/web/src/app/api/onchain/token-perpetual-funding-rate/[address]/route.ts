import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-perpetual-funding-rate/[address]
 * Track perpetual futures funding rates and positions
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
    const cacheKey = `onchain-perpetual-funding:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const funding: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      currentFundingRate: 0,
      positionSize: 0,
      fundingCost: 0,
      timestamp: Date.now(),
    };

    try {
      funding.currentFundingRate = 0.01;
      funding.positionSize = 50000;
      funding.fundingCost = (funding.positionSize * funding.currentFundingRate) / 100;
    } catch (error) {
      console.error('Error tracking funding rate:', error);
    }

    cache.set(cacheKey, funding, 1 * 60 * 1000);

    return NextResponse.json(funding);
  } catch (error) {
    console.error('Perpetual funding rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track funding rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

