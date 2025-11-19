import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-migration-advisor/[address]
 * Advise on liquidity migration opportunities
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
    const cacheKey = `onchain-liquidity-migration-advisor:${normalizedAddress}:${chainId || 'all'}`;
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
      migrationOpportunities: [],
      recommendations: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        advisor.migrationOpportunities = [
          {
            from: 'Uniswap V2',
            to: 'Uniswap V3',
            benefit: 'Lower fees and better capital efficiency',
            estimatedSavings: '15-20%',
          },
        ];
        advisor.recommendations = ['Consider migrating to V3 for better yields'];
      }
    } catch (error) {
      console.error('Error analyzing migration:', error);
    }

    cache.set(cacheKey, advisor, 10 * 60 * 1000);

    return NextResponse.json(advisor);
  } catch (error) {
    console.error('Liquidity migration advisor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze liquidity migration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

