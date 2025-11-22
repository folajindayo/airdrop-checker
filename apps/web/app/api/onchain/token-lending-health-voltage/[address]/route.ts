import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const LENDING_MARKETS = [
  {
    protocol: 'Aave V3',
    hints: ['aave', 'av3', 'pool'],
    addresses: [
      '0x7ec94c432b973a31827d5ceb4a56e0939178c8e9',
      '0x87870bca3f3a25fec44c3cf3afbf4f26e95c7e5a',
    ],
    typicalLtv: 0.75,
  },
  {
    protocol: 'Compound V3',
    hints: ['compound', 'comet'],
    addresses: ['0xc3d688b66703497daa19211eedff47f25384cdc3'],
    typicalLtv: 0.77,
  },
  {
    protocol: 'Morpho Blue',
    hints: ['morpho'],
    addresses: ['0x9994e35db50125e0df82e4c2dde62496ce330999'],
    typicalLtv: 0.8,
  },
  {
    protocol: 'Spark',
    hints: ['spark'],
    addresses: ['0x2ab02c7a4f45113f7019f7d8edcaa24fef6c4ccf'],
    typicalLtv: 0.72,
  },
] as const;

const normalize = (value?: string | null) => (value || '').toLowerCase();

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const classifyTransition = (tx: any, wallet: string) => {
  const sender = normalize(tx.from_address);
  const recipient = normalize(tx.to_address);
  const labelBlob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;

  if (sender === wallet && !labelBlob.includes('repay')) {
    return 'supply';
  }
  if (recipient === wallet && labelBlob.includes('repay')) {
    return 'repay';
  }
  if (recipient === wallet && !labelBlob.includes('repay')) {
    return 'borrow';
  }
  if (labelBlob.includes('rate switch') || labelBlob.includes('mode')) {
    return 'rate-switch';
  }
  return 'interaction';
};

const withinLookback = (timestamp: string, cutoff: number) =>
  new Date(timestamp).getTime() >= cutoff;

const matchesMarket = (market: (typeof LENDING_MARKETS)[number], tx: any) => {
  const toAddress = normalize(tx.to_address);
  if (market.addresses.includes(toAddress)) {
    return true;
  }
  const labelBlob = `${normalize(tx.to_address_label)} ${normalize(
    tx.from_address_label
  )}`;
  return market.hints.some((hint) => labelBlob.includes(hint));
};

/**
 * GET /api/onchain/token-lending-health-voltage/[address]
 * Evaluate lending protocol strain (voltage) across the wallet's positions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = Math.min(parseInt(searchParams.get('days') || '45', 10), 180);
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '150', 10), 200);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-lending-health-voltage:${normalizedAddress}:${
      chainId || '1'
    }:${lookbackDays}:${pageSize}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': pageSize,
      'with-logs': true,
    });

    const transactions = response?.data?.items || [];

    const marketSnapshots = LENDING_MARKETS.map((market) => ({
      protocol: market.protocol,
      suppliesUsd: 0,
      borrowsUsd: 0,
      repaysUsd: 0,
      rateChanges: 0,
      interactions: 0,
      lastInteraction: null as string | null,
      logs: [] as Array<{
        txHash: string;
        action: string;
        usd: number;
        occurredAt: string;
      }>,
      typicalLtv: market.typicalLtv,
    }));

    transactions.forEach((tx: any) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }

      const marketIndex = LENDING_MARKETS.findIndex((market) => matchesMarket(market, tx));
      if (marketIndex === -1) {
        return;
      }

      const snapshot = marketSnapshots[marketIndex];
      const action = classifyTransition(tx, normalizedAddress);
      const usd = toNumber(tx.value_quote);

      snapshot.interactions += 1;
      snapshot.lastInteraction = snapshot.lastInteraction || tx.block_signed_at;
      if (
        snapshot.lastInteraction &&
        new Date(tx.block_signed_at).getTime() > new Date(snapshot.lastInteraction).getTime()
      ) {
        snapshot.lastInteraction = tx.block_signed_at;
      }

      if (action === 'supply') {
        snapshot.suppliesUsd += usd;
      } else if (action === 'borrow') {
        snapshot.borrowsUsd += usd;
      } else if (action === 'repay') {
        snapshot.repaysUsd += usd;
      } else if (action === 'rate-switch') {
        snapshot.rateChanges += 1;
      }

      snapshot.logs.push({
        txHash: tx.tx_hash,
        action,
        usd: +usd.toFixed(2),
        occurredAt: tx.block_signed_at,
      });
    });

    const marketInsights = marketSnapshots
      .filter((snapshot) => snapshot.interactions > 0)
      .map((snapshot) => {
        const netDebt = snapshot.borrowsUsd - snapshot.repaysUsd;
        const collateral = snapshot.suppliesUsd;
        const effectiveLtv = collateral > 0 ? Math.min(netDebt / collateral, 1) : 0;
        const buffer = Math.max(snapshot.typicalLtv - effectiveLtv, 0);

        let voltageScore = 100;
        if (effectiveLtv > snapshot.typicalLtv) {
          voltageScore -= Math.min(70, (effectiveLtv - snapshot.typicalLtv) * 140);
        }
        if ((snapshot.rateChanges || 0) > 0) {
          voltageScore -= Math.min(15, snapshot.rateChanges * 4);
        }
        const inactivityDays = snapshot.lastInteraction
          ? (Date.now() - new Date(snapshot.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
          : null;
        if (inactivityDays && inactivityDays > 45 && netDebt > 0) {
          voltageScore -= Math.min(20, (inactivityDays - 45) * 0.6);
        }

        voltageScore = Math.max(5, Math.min(100, voltageScore));

        const stressTier =
          voltageScore >= 75 ? 'balanced' : voltageScore >= 55 ? 'watch' : 'critical';

        return {
          protocol: snapshot.protocol,
          suppliesUsd: +snapshot.suppliesUsd.toFixed(2),
          borrowsUsd: +snapshot.borrowsUsd.toFixed(2),
          netDebtUsd: +netDebt.toFixed(2),
          effectiveLtv: +effectiveLtv.toFixed(3),
          buffer: +buffer.toFixed(3),
          rateChanges: snapshot.rateChanges,
          interactions: snapshot.interactions,
          voltageScore: +voltageScore.toFixed(2),
          stressTier,
          recentInteractions: snapshot.logs
            .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
            .slice(0, 10),
        };
      })
      .sort((a, b) => b.netDebtUsd - a.netDebtUsd);

    const totalSupplies = marketInsights.reduce((sum, market) => sum + market.suppliesUsd, 0);
    const totalDebt = marketInsights.reduce((sum, market) => sum + market.netDebtUsd, 0);
    const portfolioLtv = totalSupplies > 0 ? Math.min(totalDebt / totalSupplies, 1) : 0;

    const responsePayload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      marketsTouched: marketInsights.length,
      totalSuppliesUsd: +totalSupplies.toFixed(2),
      totalDebtUsd: +totalDebt.toFixed(2),
      portfolioLtv: +portfolioLtv.toFixed(3),
      markets: marketInsights,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Lending health voltage error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compute lending health voltage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
