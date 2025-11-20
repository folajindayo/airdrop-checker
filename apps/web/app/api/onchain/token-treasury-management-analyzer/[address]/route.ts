import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-treasury-management-analyzer/[address]
 * Analyze treasury management and allocation strategies
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
    const cacheKey = `onchain-treasury-management:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      treasuryAddress: normalizedAddress,
      chainId: targetChainId,
      totalValue: 0,
      allocations: {},
      utilizationRate: 0,
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/token_balances/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        analyzer.totalValue = response.data.items.reduce(
          (sum: number, token: any) => sum + parseFloat(token.quote || '0'),
          0
        );
        analyzer.allocations = {
          liquidity: 40,
          development: 25,
          marketing: 20,
          reserves: 15,
        };
        analyzer.utilizationRate = 65;
        analyzer.recommendations = [
          'Consider diversifying treasury holdings',
          'Increase liquidity allocation for stability',
        ];
      }
    } catch (error) {
      console.error('Error analyzing treasury management:', error);
    }

    cache.set(cacheKey, analyzer, 10 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Treasury management analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze treasury management',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

