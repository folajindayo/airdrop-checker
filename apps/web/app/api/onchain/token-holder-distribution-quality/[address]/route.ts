import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-distribution-quality/[address]
 * Assess quality of holder distribution
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
    const cacheKey = `onchain-distribution-quality:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const quality: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      distributionScore: 0,
      decentralizationIndex: 0,
      holderCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        quality.holderCount = holders.length;
        const top10Balance = holders.slice(0, 10).reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        const totalBalance = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        const top10Percent = totalBalance > 0 ? (top10Balance / totalBalance) * 100 : 0;
        quality.decentralizationIndex = Math.max(0, 100 - top10Percent);
        quality.distributionScore = quality.decentralizationIndex;
      }
    } catch (error) {
      console.error('Error assessing distribution:', error);
    }

    cache.set(cacheKey, quality, 5 * 60 * 1000);

    return NextResponse.json(quality);
  } catch (error) {
    console.error('Distribution quality error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess distribution quality',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





