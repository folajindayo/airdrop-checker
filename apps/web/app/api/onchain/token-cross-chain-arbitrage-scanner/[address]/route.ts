import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const DEX_HINTS = ['swap', 'uniswap', 'curve', 'balancer', 'sushiswap', 'pancake'];
const BRIDGE_HINTS = ['bridge', 'portal', 'hop', 'stargate'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksLikeSwap = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return DEX_HINTS.some((hint) => blob.includes(hint));
};

const looksLikeBridge = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return BRIDGE_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-cross-chain-arbitrage-scanner/[address]
 * Scan for potential cross-chain arbitrage patterns in wallet activity.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '30', 10), 90);
    const limit = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-cross-chain-arbitrage:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chains = SUPPORTED_CHAINS.filter((c) => [1, 10, 137, 8453, 42161].includes(c.id));

    const swapEvents: Array<{
      chainId: number;
      txHash: string;
      valueUsd: number;
      occurredAt: string;
    }> = [];
    const bridgeEvents: Array<{
      chainId: number;
      txHash: string;
      valueUsd: number;
      occurredAt: string;
    }> = [];

    for (const chain of chains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chain.id}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
          'with-logs': true,
        });
        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() < cutoff) {
            return;
          }
          const valueUsd = toNumber(tx.value_quote);
          if (looksLikeSwap(tx)) {
            swapEvents.push({
              chainId: chain.id,
              txHash: tx.tx_hash,
              valueUsd,
              occurredAt: tx.block_signed_at,
            });
          } else if (looksLikeBridge(tx)) {
            bridgeEvents.push({
              chainId: chain.id,
              txHash: tx.tx_hash,
              valueUsd,
              occurredAt: tx.block_signed_at,
            });
          }
        });
      } catch (error) {
        console.error(`Arbitrage scan failed on chain ${chain.id}:`, error);
      }
    }

    const chainPairs = new Map<string, number>();
    swapEvents.forEach((swap) => {
      bridgeEvents.forEach((bridge) => {
        const timeDiff = Math.abs(
          new Date(swap.occurredAt).getTime() - new Date(bridge.occurredAt).getTime()
        );
        if (timeDiff < 3600000 && swap.chainId !== bridge.chainId) {
          const key = `${swap.chainId}-${bridge.chainId}`;
          chainPairs.set(key, (chainPairs.get(key) || 0) + 1);
        }
      });
    });

    const opportunities = Array.from(chainPairs.entries())
      .map(([pair, count]) => {
        const [chainA, chainB] = pair.split('-').map(Number);
        return {
          chainPair: `${chainA}-${chainB}`,
          occurrences: count,
        };
      })
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      swapsDetected: swapEvents.length,
      bridgesDetected: bridgeEvents.length,
      potentialOpportunities: opportunities.length,
      opportunities,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Cross-chain arbitrage scanner error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan for arbitrage opportunities',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
