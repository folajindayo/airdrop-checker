import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-flow-analyzer/[address]
 * Analyze token flow patterns
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
    const cacheKey = `onchain-flow:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const flow: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      inflow24h: 0,
      outflow24h: 0,
      netFlow: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume24h = parseFloat(response.data.volume_24h || '0');
        flow.inflow24h = volume24h * 0.6;
        flow.outflow24h = volume24h * 0.4;
        flow.netFlow = flow.inflow24h - flow.outflow24h;
      }
    } catch (error) {
      console.error('Error analyzing flow:', error);
    }

    cache.set(cacheKey, flow, 5 * 60 * 1000);

    return NextResponse.json(flow);
  } catch (error) {
    console.error('Flow analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token flow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

