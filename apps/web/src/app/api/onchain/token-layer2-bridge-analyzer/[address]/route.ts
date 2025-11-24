import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-layer2-bridge-analyzer/[address]
 * Analyze Layer 2 bridge activity patterns with Reown
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
    const cacheKey = `onchain-l2-bridge:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const l2Chains = [8453, 42161, 10, 137, 43114];

    const analysis: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      l2BridgeActivity: false,
      bridgedChains: [],
      timestamp: Date.now(),
    };

    try {
      if (l2Chains.includes(targetChainId)) {
        const response = await goldrushClient.get(
          `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
          { 'quote-currency': 'USD' }
        );

        if (response.data?.items) {
          analysis.l2BridgeActivity = response.data.items.length > 0;
          analysis.bridgedChains = [targetChainId];
        }
      }
    } catch (error) {
      console.error('Error analyzing L2 bridges:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Layer 2 bridge analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze Layer 2 bridge activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






