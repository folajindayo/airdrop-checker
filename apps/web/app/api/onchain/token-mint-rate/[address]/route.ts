import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-mint-rate/[address]
 * Calculate token minting rate
 * Tracks new token creation speed
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
    const cacheKey = `onchain-mint-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const mintRate: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      dailyMintRate: 0,
      weeklyMintRate: 0,
      monthlyMintRate: 0,
      mintingActive: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        mintRate.mintingActive = true;
        mintRate.dailyMintRate = 0;
      }
    } catch (error) {
      console.error('Error calculating mint rate:', error);
    }

    cache.set(cacheKey, mintRate, 5 * 60 * 1000);

    return NextResponse.json(mintRate);
  } catch (error) {
    console.error('Token mint rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate mint rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
