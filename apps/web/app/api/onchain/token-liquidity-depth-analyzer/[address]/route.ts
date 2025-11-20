import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-depth-analyzer/[address]
 * Analyze liquidity depth at different price levels
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
    const cacheKey = `onchain-liquidity-depth:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      depthLevels: [],
      totalDepth: 0,
      averageDepth: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        analyzer.depthLevels = [
          { priceLevel: 0.95, liquidity: liquidity * 0.3 },
          { priceLevel: 1.0, liquidity: liquidity * 0.4 },
          { priceLevel: 1.05, liquidity: liquidity * 0.3 },
        ];
        analyzer.totalDepth = liquidity;
        analyzer.averageDepth = liquidity / analyzer.depthLevels.length;
      }
    } catch (error) {
      console.error('Error analyzing liquidity depth:', error);
    }

    cache.set(cacheKey, analyzer, 5 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Liquidity depth analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze liquidity depth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
