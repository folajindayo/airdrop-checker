import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-gas-optimization-advisor/[address]
 * Provide gas optimization recommendations for transactions
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
    const cacheKey = `onchain-gas-advisor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const advisor: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      recommendations: [],
      potentialSavings: 0,
      optimizationScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 50 }
      );

      if (response.data && response.data.items) {
        const avgGas = response.data.items.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.gas_spent || '0'), 0) / response.data.items.length;
        
        advisor.recommendations = ['batch_transactions', 'use_layer2', 'optimize_timing'];
        advisor.potentialSavings = avgGas * 0.3;
        advisor.optimizationScore = avgGas > 100000 ? 75 : 50;
      }
    } catch (error) {
      console.error('Error generating gas advice:', error);
    }

    cache.set(cacheKey, advisor, 10 * 60 * 1000);

    return NextResponse.json(advisor);
  } catch (error) {
    console.error('Gas optimization advisor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate gas optimization advice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

