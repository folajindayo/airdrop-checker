import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const ROLLUP_IDS = [10, 42161, 8453];
const REBATE_HINTS = ['rebate', 'refund', 'paymaster', 'gas refund', 'gas rebate'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const isInbound = (tx: any, wallet: string) => normalize(tx.to_address) === wallet;
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksLikeRebate = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)} ${
    tx.log_events?.map((log: any) => normalize(log.sender_name)).join(' ') || ''
  }`;
  return REBATE_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-rollup-gas-rebate-ledger/[address]
 * Ledger of gas rebates/refunds received on major rollups.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '60', 10), 180);
    const limit = Math.min(parseInt(searchParams.get('limit') || '140', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-rollup-gas-rebate:${normalizedAddress}:${lookbackDays}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const chainInsights: Array<{
      chainId: number;
      rebates: number;
      totalUsd: number;
      avgUsd: number;
      recent: Array<{
        txHash: string;
        receivedAt: string;
        usdValue: number;
        label: string | null;
      }>;
    }> = [];

    for (const chainId of ROLLUP_IDS) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v1/${chainId}/address/${normalizedAddress}/transactions_v3/`, {
          'page-size': limit,
          'with-logs': true,
        });

        const items = response?.data?.items || [];
        const rebates = items
          .filter((tx) => new Date(tx.block_signed_at).getTime() >= cutoff)
          .filter((tx) => isInbound(tx, normalizedAddress))
          .filter(looksLikeRebate)
          .map((tx) => ({
            txHash: tx.tx_hash,
            receivedAt: tx.block_signed_at,
            usdValue: +toNumber(tx.value_quote).toFixed(3),
            label: tx.from_address_label || tx.to_address_label || null,
          }));

        if (!rebates.length) {
          continue;
        }

        const totalUsd = rebates.reduce((sum, rebate) => sum + rebate.usdValue, 0);
        chainInsights.push({
          chainId,
          rebates: rebates.length,
          totalUsd: +totalUsd.toFixed(3),
          avgUsd: +(totalUsd / rebates.length).toFixed(3),
          recent: rebates.slice(0, 10),
        });
      } catch (error) {
        console.error(`Rollup rebate ledger failed on chain ${chainId}:`, error);
      }
    }

    const totalRebates = chainInsights.reduce((sum, chain) => sum + chain.rebates, 0);
    const totalUsd = chainInsights.reduce((sum, chain) => sum + chain.totalUsd, 0);

    const payload = {
      address: normalizedAddress,
      lookbackDays,
      chainsCovered: chainInsights.length,
      totalRebates,
      totalUsd: +totalUsd.toFixed(3),
      chains: chainInsights.sort((a, b) => b.totalUsd - a.totalUsd),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Rollup gas rebate ledger error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build rollup gas rebate ledger',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
