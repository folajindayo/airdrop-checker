import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-mev-protection-advisor/[address]
 * Provide MEV protection recommendations
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
    const cacheKey = `onchain-mev-protection-advisor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const advisor: any = {
      walletAddress: normalizedAddress,
      chainId: targetChainId,
      mevRiskScore: 0,
      protectionMethods: [],
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 50 }
      );

      if (response.data && response.data.items) {
        const largeTxs = response.data.items.filter(
          (tx: any) => parseFloat(tx.value_quote || '0') > 10000
        );
        advisor.mevRiskScore = Math.min(largeTxs.length * 10, 100);
        advisor.protectionMethods = [
          'Use private mempool (Flashbots)',
          'Set maximum slippage limits',
          'Use DEX aggregators',
        ];
        advisor.recommendations = advisor.mevRiskScore > 50
          ? ['High MEV risk detected - consider using private transactions']
          : ['MEV risk is manageable with standard protections'];
      }
    } catch (error) {
      console.error('Error analyzing MEV protection:', error);
    }

    cache.set(cacheKey, advisor, 5 * 60 * 1000);

    return NextResponse.json(advisor);
  } catch (error) {
    console.error('MEV protection advisor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze MEV protection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

