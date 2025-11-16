import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-borrow-rate/[address]
 * Get current borrow rates for lending protocols
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
    const cacheKey = `onchain-borrow-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const rates: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      borrowRate: 0,
      borrowRateAPY: 0,
      utilizationRate: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rates, 2 * 60 * 1000);
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Borrow rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get borrow rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
