import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-airdrop-eligibility-scorer/[address]
 * Score wallet eligibility for token airdrops
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
    const cacheKey = `onchain-airdrop-eligibility-scorer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    let score = 0;
    const factors: any = {
      transactionCount: 0,
      uniqueProtocols: 0,
      totalValue: 0,
      holdingPeriod: 0,
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        factors.transactionCount = response.data.items.length;
        score += Math.min(factors.transactionCount * 2, 40);

        const protocols = new Set();
        let totalValue = 0;
        response.data.items.forEach((tx: any) => {
          if (tx.to_address) protocols.add(tx.to_address);
          totalValue += parseFloat(tx.value_quote || '0');
        });

        factors.uniqueProtocols = protocols.size;
        factors.totalValue = totalValue;
        score += Math.min(factors.uniqueProtocols * 10, 30);
        score += Math.min(Math.log10(totalValue + 1) * 5, 30);
      }
    } catch (error) {
      console.error('Error scoring eligibility:', error);
    }

    const result = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      eligibilityScore: Math.min(score, 100),
      factors,
      tier: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Airdrop eligibility scorer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to score airdrop eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

