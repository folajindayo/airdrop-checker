import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-restaking-yield/[address]
 * Track restaking yields and rewards across AVS providers
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
    const cacheKey = `onchain-restaking-yield:${normalizedAddress}:${chainId || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const restaking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      avsPositions: [],
      blendedAPY: 0,
      rewardTokens: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/defi_positions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        const avs = response.data.items.filter((item: any) =>
          (item.protocol_name || '').toLowerCase().includes('restake')
        );
        restaking.avsPositions = avs.map((item: any) => ({
          protocol: item.protocol_name,
          apy: item.apy,
          value: item.total_usd_value,
        }));
        restaking.rewardTokens = Array.from(
          new Set(avs.flatMap((item: any) => item.rewards?.map((reward: any) => reward.ticker) || []))
        );
        restaking.blendedAPY =
          restaking.avsPositions.reduce((sum: number, item: any) => sum + (item.apy || 0), 0) /
          (restaking.avsPositions.length || 1);
      }
    } catch (error) {
      console.error('Restaking yield fetch error:', error);
    }

    cache.set(cacheKey, restaking, 5 * 60 * 1000);

    return NextResponse.json(restaking);
  } catch (error) {
    console.error('Restaking yield error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate restaking yields',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
