import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress, SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const BRIDGE_CONTRACTS: Record<number, string[]> = {
  1: [
    '0x4d9079bb4165aeb4084c526a32695dcfd2f77381', // Stargate Router
    '0x3d4cc8a61c7528fd86c55cfe061a78eba0be1edf', // Hop ETH Bridge
    '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', // Optimism Gateway
  ],
  42161: [
    '0x72ce9c84678fcf5773585282c2a5140ee5c2c462', // Arbitrum Bridge
    '0xcEe284F754E854890e311e3280b767F80797180d', // Arbitrum Inbox
  ].map((addr) => addr.toLowerCase()),
  10: ['0x4200000000000000000000000000000000000010', '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1'],
  137: ['0x3a78d8e6129c0a63ce10e1d520ea1c5ae0ea01ff'], // Polygon PoS bridge
  8453: ['0x0000000000000000000000000000000000000000'], // Placeholder for Base (Intent: fetch via labels)
};

const MAX_TXS = 150;

type BridgeTx = {
  tx_hash: string;
  block_signed_at: string;
  successful: boolean;
  to_address?: string | null;
  to_address_label?: string | null;
  value_quote?: number;
  gas_quote?: number;
  chainId: number;
};

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const normalizeAddress = (address?: string | null): string =>
  (address || '').toLowerCase();

const matchesBridgeContract = (chainId: number, address?: string | null, label?: string | null) => {
  if (!address && !label) return false;
  const normalized = normalizeAddress(address);
  const list = BRIDGE_CONTRACTS[chainId] || [];
  if (normalized && list.includes(normalized)) {
    return true;
  }
  const labelValue = label?.toLowerCase() || '';
  if (!labelValue) return false;
  return (
    labelValue.includes('bridge') ||
    labelValue.includes('stargate') ||
    labelValue.includes('portal') ||
    labelValue.includes('hop') ||
    labelValue.includes('wormhole')
  );
};

/**
 * GET /api/onchain/token-bridge-risk-sentiment/[address]
 * Build a bridge risk sentiment gauge from recent bridge activity.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '30', 10), 90);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-bridge-risk:${normalizedAddress}:${chainId || 'all'}:${lookbackDays}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((chain) => chain.id === parseInt(chainId, 10))
      : SUPPORTED_CHAINS.filter((chain) => BRIDGE_CONTRACTS[chain.id]);

    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const bridgeTxs: BridgeTx[] = [];

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get<{
          data?: { items?: any[] };
        }>(`/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`, {
          'quote-currency': 'USD',
          'page-size': MAX_TXS,
          'block-signed-at-asc': false,
        });

        const items = response?.data?.items || [];
        items.forEach((tx) => {
          if (new Date(tx.block_signed_at).getTime() < cutoff) {
            return;
          }
          const isBridge = matchesBridgeContract(
            chain.id,
            tx.to_address,
            tx.to_address_label
          );
          if (isBridge) {
            bridgeTxs.push({
              tx_hash: tx.tx_hash,
              block_signed_at: tx.block_signed_at,
              successful: tx.successful,
              to_address: tx.to_address,
              to_address_label: tx.to_address_label,
              value_quote: tx.value_quote,
              gas_quote: tx.gas_quote,
              chainId: chain.id,
            });
          }
        });
      } catch (error) {
        console.error(`Bridge risk fetch failed on chain ${chain.id}:`, error);
      }
    }

    const totalBridgeTxs = bridgeTxs.length;
    const failedBridgeTxs = bridgeTxs.filter((tx) => !tx.successful).length;
    const failRatio = totalBridgeTxs ? failedBridgeTxs / totalBridgeTxs : 0;
    const avgValueUsd = average(bridgeTxs.map((tx) => tx.value_quote || 0));
    const avgGasUsd = average(bridgeTxs.map((tx) => tx.gas_quote || 0));

    const bridgesByAddress = bridgeTxs.reduce<Record<string, number>>((acc, tx) => {
      const key = tx.to_address_label || normalizeAddress(tx.to_address);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const bridgeBreakdown = Object.entries(bridgesByAddress)
      .map(([bridge, count]) => ({
        bridge,
        count,
        share: totalBridgeTxs ? +(count / totalBridgeTxs).toFixed(3) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const concentrationShare = bridgeBreakdown[0]?.share || 0;

    let score = 100;
    const deductions: Array<{ factor: string; impact: number; detail: string }> = [];

    if (failRatio > 0) {
      const impact = Math.min(45, failRatio * 100);
      score -= impact;
      deductions.push({
        factor: 'failed-settlements',
        impact: +impact.toFixed(2),
        detail: `${(failRatio * 100).toFixed(1)}% bridge tx failures`,
      });
    }

    if (avgGasUsd > 20) {
      const impact = Math.min(25, (avgGasUsd - 20) * 1.2);
      score -= impact;
      deductions.push({
        factor: 'high-cost',
        impact: +impact.toFixed(2),
        detail: `avg bridge gas ${avgGasUsd.toFixed(2)} USD`,
      });
    }

    if (concentrationShare > 0.65) {
      const impact = Math.min(20, (concentrationShare - 0.65) * 60);
      score -= impact;
      deductions.push({
        factor: 'bridge-concentration',
        impact: +impact.toFixed(2),
        detail: `${(concentrationShare * 100).toFixed(1)}% volume via single bridge`,
      });
    }

    score = Math.max(5, Math.min(100, score));

    const gaugeState =
      score >= 75 ? 'stable' : score >= 55 ? 'watch' : 'critical';

    const responsePayload = {
      address: normalizedAddress,
      chainsInspected: targetChains.map((chain) => chain.id),
      lookbackDays,
      gauge: {
        score: +score.toFixed(2),
        state: gaugeState,
        deductions,
      },
      stats: {
        totalBridgeTxs,
        failedBridgeTxs,
        avgValueUsd: +avgValueUsd.toFixed(2),
        avgGasUsd: +avgGasUsd.toFixed(2),
        distinctBridges: bridgeBreakdown.length,
        concentrationShare,
      },
      bridges: bridgeBreakdown.slice(0, 6),
      recentBridgeTxs: bridgeTxs
        .sort(
          (a, b) =>
            new Date(b.block_signed_at).getTime() - new Date(a.block_signed_at).getTime()
        )
        .slice(0, 10),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 2 * 60 * 1000);
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Bridge risk sentiment error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute bridge risk sentiment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

