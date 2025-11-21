import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquid-staking-health/[address]
 * Evaluate liquid staking positions and protocol health
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
    const cacheKey = `onchain-liquid-staking-health:${normalizedAddress}:${chainId || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const health: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      protocols: [],
      aggregateAPY: 0,
      diversificationScore: 0,
      depegRisk: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/defi_positions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data && response.data.items) {
        const stPositions = response.data.items.filter((item: any) =>
          (item.protocol_name || '').toLowerCase().includes('staked')
        );
        health.protocols = stPositions.map((item: any) => ({
          protocol: item.protocol_name,
          apy: item.apy,
          value: item.total_usd_value,
        }));
        health.aggregateAPY =
          health.protocols.reduce((sum: number, item: any) => sum + (item.apy || 0), 0) /
          (health.protocols.length || 1);
        health.diversificationScore = Math.min(100, health.protocols.length * 12.5);
        health.depegRisk = health.aggregateAPY > 8 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Liquid staking health fetch error:', error);
    }

    cache.set(cacheKey, health, 5 * 60 * 1000);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Liquid staking health error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate liquid staking health',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
