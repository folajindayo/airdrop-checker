import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-burn-rate/[address]
 * Track token burn rate and deflation
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
    const cacheKey = `onchain-burn-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const burnRate: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      burnedAmount: 0,
      burnRate: 0,
      deflationRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        const circulatingSupply = parseFloat(response.data.circulating_supply || totalSupply);
        burnRate.burnedAmount = totalSupply - circulatingSupply;
        burnRate.deflationRate = totalSupply > 0 ? 
          (burnRate.burnedAmount / totalSupply) * 100 : 0;
      }
    } catch (error) {
      console.error('Error tracking burn rate:', error);
    }

    cache.set(cacheKey, burnRate, 5 * 60 * 1000);

    return NextResponse.json(burnRate);
  } catch (error) {
    console.error('Burn rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track burn rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
