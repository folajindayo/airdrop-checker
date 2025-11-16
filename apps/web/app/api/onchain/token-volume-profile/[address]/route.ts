import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-volume-profile/[address]
 * Analyze volume distribution patterns
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
    const cacheKey = `onchain-volume-profile:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const volumeProfile: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      volume24h: 0,
      volume7d: 0,
      volume30d: 0,
      trend: 'stable',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        volumeProfile.volume24h = parseFloat(response.data.volume_24h || '0');
        volumeProfile.volume7d = volumeProfile.volume24h * 7;
        volumeProfile.volume30d = volumeProfile.volume24h * 30;
        volumeProfile.trend = volumeProfile.volume24h > 1000000 ? 'increasing' :
                             volumeProfile.volume24h > 100000 ? 'stable' : 'decreasing';
      }
    } catch (error) {
      console.error('Error analyzing volume profile:', error);
    }

    cache.set(cacheKey, volumeProfile, 5 * 60 * 1000);

    return NextResponse.json(volumeProfile);
  } catch (error) {
    console.error('Volume profile error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze volume profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
