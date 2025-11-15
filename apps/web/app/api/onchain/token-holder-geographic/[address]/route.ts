import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-geographic/[address]
 * Analyze geographic distribution of holders
 * Estimates holder locations by timezone patterns
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
    const cacheKey = `onchain-geographic:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const geographic: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      timezoneDistribution: {} as Record<string, number>,
      mostActiveRegion: 'unknown',
      diversity: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const timezones: Record<string, number> = {};

        holders.forEach((holder: any) => {
          const lastTransfer = new Date(holder.last_transferred_at || 0);
          const hour = lastTransfer.getUTCHours();
          const timezone = hour < 6 ? 'asia' : hour < 14 ? 'europe' : 'americas';
          timezones[timezone] = (timezones[timezone] || 0) + 1;
        });

        geographic.timezoneDistribution = timezones;
        geographic.mostActiveRegion = Object.keys(timezones).reduce((a, b) => 
          timezones[a] > timezones[b] ? a : b, 'unknown');
        geographic.diversity = Object.keys(timezones).length;
      }
    } catch (error) {
      console.error('Error analyzing geography:', error);
    }

    cache.set(cacheKey, geographic, 10 * 60 * 1000);

    return NextResponse.json(geographic);
  } catch (error) {
    console.error('Geographic analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze geographic distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

