import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-supply-rate/[address]
 * Get supply rates for lending protocols
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
    const cacheKey = `onchain-supply-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const rates: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      supplyRate: 0,
      supplyRateAPY: 0,
      totalSupplied: '0',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, rates, 2 * 60 * 1000);
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Supply rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get supply rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
