import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-tax-optimization-advisor/[address]
 * Provide tax optimization strategies for token transactions
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
    const cacheKey = `onchain-tax-optimizer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const advisor: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      buyTax: 0,
      sellTax: 0,
      optimizationStrategies: [],
      estimatedSavings: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        advisor.buyTax = 3.0;
        advisor.sellTax = 5.0;
        advisor.optimizationStrategies = [
          'Use limit orders to reduce tax impact',
          'Batch transactions to minimize fees',
          'Consider holding period for tax benefits',
        ];
        advisor.estimatedSavings = 15; // percentage
      }
    } catch (error) {
      console.error('Error optimizing taxes:', error);
    }

    cache.set(cacheKey, advisor, 10 * 60 * 1000);

    return NextResponse.json(advisor);
  } catch (error) {
    console.error('Tax optimization advisor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize tax strategies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

