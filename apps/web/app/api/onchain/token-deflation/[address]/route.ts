import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-deflation/[address]
 * Track token deflation mechanisms
 * Monitors burn events and supply reduction
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
    const cacheKey = `onchain-deflation:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const deflation: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      totalBurned: 0,
      burnRate: 0,
      isDeflationary: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        const circulatingSupply = parseFloat(response.data.circulating_supply || '0');
        const burned = totalSupply - circulatingSupply;
        
        deflation.totalBurned = burned;
        deflation.burnRate = totalSupply > 0 ? (burned / totalSupply) * 100 : 0;
        deflation.isDeflationary = deflation.burnRate > 0;
      }
    } catch (error) {
      console.error('Error tracking deflation:', error);
    }

    cache.set(cacheKey, deflation, 5 * 60 * 1000);

    return NextResponse.json(deflation);
  } catch (error) {
    console.error('Token deflation tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track token deflation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
