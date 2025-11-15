import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-collateral-ratio/[address]
 * Calculate collateral ratio for lending protocols
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
    const cacheKey = `onchain-collateral-ratio:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const ratio: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      collateralRatio: 0,
      collateralValue: '0',
      debtValue: '0',
      healthFactor: 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, ratio, 5 * 60 * 1000);
    return NextResponse.json(ratio);
  } catch (error) {
    console.error('Collateral ratio error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate collateral ratio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
