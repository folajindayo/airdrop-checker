import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-concentration/[address]
 * Analyze token concentration and distribution
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
    const cacheKey = `onchain-concentration:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const concentration: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      top10Concentration: 0,
      giniCoefficient: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalSupply = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        
        const top10 = holders.slice(0, 10);
        const top10Balance = top10.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        
        concentration.top10Concentration = totalSupply > 0 ? 
          (top10Balance / totalSupply) * 100 : 0;
      }
    } catch (error) {
      console.error('Error analyzing concentration:', error);
    }

    cache.set(cacheKey, concentration, 5 * 60 * 1000);

    return NextResponse.json(concentration);
  } catch (error) {
    console.error('Concentration analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze concentration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

