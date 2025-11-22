import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const BRIDGE_HINTS = ['bridge', 'portal', 'wormhole', 'layerzero', 'stargate'];

const isBridgeTransaction = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return BRIDGE_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-bridge-usage-analyzer/[address]
 * Analyze bridge usage patterns across chains.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-bridge-usage:${normalizedAddress}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const chains = SUPPORTED_CHAINS.slice(0, 5);
    const bridgeStats = new Map<number, { count: number; volume: number }>();

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
        });
        const items = (response?.data?.items || []).filter(isBridgeTransaction);
        if (items.length > 0) {
          const volume = items.reduce((sum, tx) => sum + toNumber(tx.value_quote), 0);
          bridgeStats.set(chain.id, { count: items.length, volume });
        }
      } catch (error) {
        console.error(`Bridge usage fetch failed on chain ${chain.id}:`, error);
      }
    }

    const usage = Array.from(bridgeStats.entries()).map(([chainId, stats]) => ({
      chainId,
      chainName: chains.find((c) => c.id === chainId)?.name || `Chain ${chainId}`,
      bridgeCount: stats.count,
      totalVolumeUsd: +stats.volume.toFixed(2),
    }));

    const payload = {
      address: normalizedAddress,
      chainsAnalyzed: chains.length,
      totalBridgeTransactions: Array.from(bridgeStats.values()).reduce((sum, s) => sum + s.count, 0),
      usage,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Bridge usage analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze bridge usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

