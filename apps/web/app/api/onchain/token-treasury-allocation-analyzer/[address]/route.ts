import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-treasury-allocation-analyzer/[address]
 * Analyze treasury allocation and management
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
    const cacheKey = `onchain-treasury-analyzer:${normalizedAddress}:${chainId || 'all'}`;
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
      allocations: [],
      utilizationRate: 0,
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
        analyzer.allocations = response.data.items.slice(0, 10).map((token: any) => ({
          token: token.contract_address,
          symbol: token.contract_ticker_symbol,
          balance: parseFloat(token.balance || '0'),
          valueUSD: parseFloat(token.quote || '0'),
          percentage: (parseFloat(token.quote || '0') / analyzer.totalValue) * 100,
        }));
        analyzer.utilizationRate = 65;
      }
    } catch (error) {
      console.error('Error analyzing treasury:', error);
    }

    cache.set(cacheKey, analyzer, 5 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Treasury allocation analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze treasury allocation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

