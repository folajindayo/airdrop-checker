import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-inflation/[address]
 * Track token inflation and minting
 * Monitors supply increases over time
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
    const cacheKey = `onchain-inflation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const inflation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      currentSupply: 0,
      maxSupply: 0,
      inflationRate: 0,
      isInflationary: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        inflation.currentSupply = parseFloat(response.data.total_supply || '0');
        inflation.maxSupply = parseFloat(response.data.max_supply || '0');
        inflation.isInflationary = inflation.maxSupply === 0 || inflation.currentSupply < inflation.maxSupply;
      }
    } catch (error) {
      console.error('Error tracking inflation:', error);
    }

    cache.set(cacheKey, inflation, 5 * 60 * 1000);

    return NextResponse.json(inflation);
  } catch (error) {
    console.error('Token inflation tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track token inflation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
