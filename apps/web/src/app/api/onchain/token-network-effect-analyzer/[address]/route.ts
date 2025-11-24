import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-network-effect-analyzer/[address]
 * Analyze network effects and growth patterns for tokens
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
    const cacheKey = `onchain-network-effect:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const networkEffect: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      holderGrowthRate: 0,
      transactionVelocity: 0,
      networkScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        networkEffect.holderGrowthRate = parseFloat(response.data.holder_count || '0');
        networkEffect.networkScore = networkEffect.holderGrowthRate > 1000 ? 85 : 50;
      }
    } catch (error) {
      console.error('Error analyzing network effects:', error);
    }

    cache.set(cacheKey, networkEffect, 5 * 60 * 1000);

    return NextResponse.json(networkEffect);
  } catch (error) {
    console.error('Network effect analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze network effects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
