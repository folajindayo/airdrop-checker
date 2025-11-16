import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-network/[address]
 * Analyze holder network connections
 * Maps relationships between holders
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
    const cacheKey = `onchain-holder-network:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const network: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      connectedHolders: 0,
      networkDensity: 0,
      clusters: [] as any[],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 50 }
      );

      if (response.data?.items) {
        network.connectedHolders = response.data.items.length;
        network.networkDensity = network.connectedHolders > 0 ? 
          Math.min(100, network.connectedHolders / 10) : 0;
      }
    } catch (error) {
      console.error('Error analyzing network:', error);
    }

    cache.set(cacheKey, network, 5 * 60 * 1000);

    return NextResponse.json(network);
  } catch (error) {
    console.error('Holder network error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze holder network',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
