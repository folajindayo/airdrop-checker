import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const YIELD_PROTOCOLS = ['aave', 'compound', 'yearn', 'convex', 'curve', 'balancer', 'uniswap'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const detectYieldProtocol = (tx: any): string | null => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  for (const protocol of YIELD_PROTOCOLS) {
    if (blob.includes(protocol)) {
      return protocol;
    }
  }
  return null;
};

/**
 * GET /api/onchain/token-yield-farming-strategy/[address]
 * Optimize yield farming strategies across protocols.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '90', 10), 365);
    const limit = Math.min(parseInt(searchParams.get('limit') || '180', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-yield-strategy:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.slice(0, 5);

    const protocolStats = new Map<string, {
      interactions: number;
      totalValueUsd: number;
      chains: Set<number>;
    }>();

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() < cutoff) return;
          const protocol = detectYieldProtocol(tx);
          if (protocol) {
            if (!protocolStats.has(protocol)) {
              protocolStats.set(protocol, { interactions: 0, totalValueUsd: 0, chains: new Set() });
            }
            const stats = protocolStats.get(protocol)!;
            stats.interactions += 1;
            stats.totalValueUsd += toNumber(tx.value_quote);
            stats.chains.add(chain.id);
          }
        });
      } catch (error) {
        console.error(`Yield strategy fetch failed on chain ${chain.id}:`, error);
      }
    }

    const strategies = Array.from(protocolStats.entries())
      .map(([protocol, stats]) => ({
        protocol,
        interactions: stats.interactions,
        totalValueUsd: +stats.totalValueUsd.toFixed(2),
        chainsUsed: stats.chains.size,
        avgValuePerTx: +(stats.totalValueUsd / stats.interactions).toFixed(2),
      }))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      protocolsTouched: strategies.length,
      strategies,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Yield farming strategy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize yield farming strategy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
