import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-network-effect-analyzer/[address]
 * Analyze network effects and token adoption patterns
 * Measures viral growth potential
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-network-effect:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const networkEffect: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      networkScore: 0,
      growthVelocity: 0,
      adoptionRate: 0,
      timestamp: Date.now(),
    };

    try {
      const holdersResponse = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (holdersResponse.data?.items) {
        const holders = holdersResponse.data.items;
        networkEffect.holderCount = holders.length;
        
        const recentGrowth = holders.filter((h: any) => {
          const firstTx = h.first_transaction_date;
          if (!firstTx) return false;
          const daysSince = (Date.now() - new Date(firstTx).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince < 7;
        }).length;
        
        networkEffect.growthVelocity = recentGrowth;
        networkEffect.adoptionRate = holders.length > 0 
          ? (recentGrowth / holders.length) * 100 
          : 0;
        
        networkEffect.networkScore = Math.min(
          (networkEffect.holderCount / 1000) * 30 + 
          (networkEffect.growthVelocity / 10) * 40 + 
          (networkEffect.adoptionRate / 10) * 30,
          100
        );
      }
    } catch (error) {
      console.error('Error analyzing network effects:', error);
    }

    cache.set(cacheKey, networkEffect, 10 * 60 * 1000);

    return NextResponse.json(networkEffect);
  } catch (error) {
    console.error('Network effect analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze network effects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
