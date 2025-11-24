import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-depth-analyzer/[address]
 * Analyze market depth across different price levels
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
    const cacheKey = `onchain-market-depth:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const depth: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      bidDepth: 0,
      askDepth: 0,
      depthScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        depth.bidDepth = liquidity * 0.5;
        depth.askDepth = liquidity * 0.5;
        depth.depthScore = Math.min(100, (liquidity / 1000000) * 20);
      }
    } catch (error) {
      console.error('Error analyzing depth:', error);
    }

    cache.set(cacheKey, depth, 2 * 60 * 1000);

    return NextResponse.json(depth);
  } catch (error) {
    console.error('Market depth analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze market depth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
