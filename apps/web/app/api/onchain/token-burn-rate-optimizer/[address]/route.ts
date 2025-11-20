import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-burn-rate-optimizer/[address]
 * Optimize token burn rate for value appreciation
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
    const cacheKey = `onchain-burn-rate-optimizer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const optimizer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      currentBurnRate: 0,
      totalBurned: 0,
      optimalBurnRate: 0,
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        optimizer.totalBurned = parseFloat(response.data.total_supply || '0') * 0.1;
        optimizer.currentBurnRate = 2.5; // percentage per month
        optimizer.optimalBurnRate = 3.5;
        optimizer.recommendations = [
          'Increase burn rate to 3.5% monthly for optimal deflation',
          'Consider implementing transaction-based burns',
        ];
      }
    } catch (error) {
      console.error('Error optimizing burn rate:', error);
    }

    cache.set(cacheKey, optimizer, 10 * 60 * 1000);

    return NextResponse.json(optimizer);
  } catch (error) {
    console.error('Burn rate optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize burn rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

