import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const STAKING_PROVIDERS = [
  {
    name: 'Lido',
    depositAddresses: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    labelHints: ['lido', 'steth'],
    expectedApr: 4.05,
  },
  {
    name: 'Rocket Pool',
    depositAddresses: ['0xae78736cd615f374d3085123a210448e74fc6393'],
    labelHints: ['rocket', 'reth'],
    expectedApr: 3.32,
  },
  {
    name: 'Frax Ether',
    depositAddresses: ['0xac3e018457b222d93114458476f3e3416abbe38f'],
    labelHints: ['frxeth', 'sfrx', 'frax'],
    expectedApr: 4.2,
  },
  {
    name: 'StakeWise',
    depositAddresses: ['0xfe2e637202056d30016725477c5da089ab0a043a'],
    labelHints: ['stakewise', 'swise'],
    expectedApr: 3.75,
  },
] as const;

const normalize = (value?: string | null) => (value || '').toLowerCase();

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
};

const msToDays = (ms: number) => +(ms / (1000 * 60 * 60 * 24)).toFixed(2);

const withinLookback = (timestamp: string, cutoff: number) => {
  const blockTime = new Date(timestamp).getTime();
  return Number.isFinite(blockTime) && blockTime >= cutoff;
};

const matchesProvider = (
  provider: (typeof STAKING_PROVIDERS)[number],
  tx: any
) => {
  const toAddress = normalize(tx.to_address);
  const fromLabel = normalize(tx.from_address_label);
  const toLabel = normalize(tx.to_address_label);
  if (provider.depositAddresses.includes(toAddress)) {
    return true;
  }
  const combined = `${fromLabel} ${toLabel}`;
  return provider.labelHints.some((hint) => combined.includes(hint));
};

const wasInitiatedByWallet = (tx: any, wallet: string) =>
  normalize(tx.from_address) === wallet;

const wasInboundToWallet = (tx: any, wallet: string) =>
  normalize(tx.to_address) === wallet;

const getLookbackDays = (value?: string | null) => {
  if (!value) return 90;
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 90;
  return Math.min(parsed, 365);
};

/**
 * GET /api/onchain/token-validator-yield-leakage/[address]
 * Estimate validator yield leakage by measuring staking activity, gas drag, and inactivity.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const lookbackDays = getLookbackDays(searchParams.get('days'));
    const pageSize = Math.min(
      parseInt(searchParams.get('limit') || '175', 10),
      200
    );

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-validator-yield-leakage:${normalizedAddress}:${
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

    const providerSnapshots = STAKING_PROVIDERS.map((provider) => ({
      provider: provider.name,
      expectedApr: provider.expectedApr,
      gasSpentUsd: 0,
      totalDepositedUsd: 0,
      totalWithdrawnUsd: 0,
      operations: 0,
      lastInteraction: null as string | null,
      inactiveDays: null as number | null,
      leakagePct: 0,
      projectedNetApr: provider.expectedApr,
    }));

    transactions.forEach((tx) => {
      if (!withinLookback(tx.block_signed_at, cutoff)) {
        return;
      }

      const matchingProviderIndex = STAKING_PROVIDERS.findIndex((provider) =>
        matchesProvider(provider, tx)
      );

      if (matchingProviderIndex === -1) {
        return;
      }

      const snapshot = providerSnapshots[matchingProviderIndex];
      const isWalletInitiated = wasInitiatedByWallet(tx, normalizedAddress);
      const isInbound = wasInboundToWallet(tx, normalizedAddress);
      const valueQuote = toNumber(tx.value_quote);
      const gasQuote = toNumber(tx.gas_quote);

      snapshot.operations += 1;
      snapshot.gasSpentUsd += gasQuote;
      snapshot.lastInteraction = snapshot.lastInteraction || tx.block_signed_at;
      if (
        snapshot.lastInteraction &&
        new Date(tx.block_signed_at).getTime() >
          new Date(snapshot.lastInteraction).getTime()
      ) {
        snapshot.lastInteraction = tx.block_signed_at;
      }

      if (isWalletInitiated && valueQuote > 0) {
        snapshot.totalDepositedUsd += valueQuote;
      }

      if (isInbound && valueQuote > 0 && !isWalletInitiated) {
        snapshot.totalWithdrawnUsd += valueQuote;
      }
    });

    const providerInsights = providerSnapshots
      .filter((snapshot) => snapshot.operations > 0)
      .map((snapshot) => {
        const netPrincipal = snapshot.totalDepositedUsd - snapshot.totalWithdrawnUsd;
        const leakagePct = netPrincipal > 0
          ? Math.min(100, (snapshot.gasSpentUsd / netPrincipal) * 100)
          : 0;
        const inactiveDays = snapshot.lastInteraction
          ? msToDays(Date.now() - new Date(snapshot.lastInteraction).getTime())
          : null;
        const inactivityPenalty = inactiveDays && inactiveDays > 45
          ? Math.min(25, (inactiveDays - 45) * 0.35)
          : 0;
        const projectedNetApr = Math.max(
          0,
          snapshot.expectedApr - leakagePct - inactivityPenalty
        );
        const health = projectedNetApr >= snapshot.expectedApr * 0.8
          ? 'efficient'
          : projectedNetApr >= snapshot.expectedApr * 0.5
          ? 'watch'
          : 'leaking';

        return {
          provider: snapshot.provider,
          operations: snapshot.operations,
          totalDepositedUsd: +snapshot.totalDepositedUsd.toFixed(2),
          totalWithdrawnUsd: +snapshot.totalWithdrawnUsd.toFixed(2),
          gasSpentUsd: +snapshot.gasSpentUsd.toFixed(2),
          leakagePct: +leakagePct.toFixed(3),
          expectedApr: snapshot.expectedApr,
          projectedNetApr: +projectedNetApr.toFixed(3),
          lastInteraction: snapshot.lastInteraction,
          inactiveDays,
          health,
        };
      })
      .sort((a, b) => b.totalDepositedUsd - a.totalDepositedUsd);

    const netPrincipalUsd = providerInsights.reduce(
      (sum, provider) => sum + (provider.totalDepositedUsd - provider.totalWithdrawnUsd),
      0
    );

    const totalGasUsd = providerInsights.reduce(
      (sum, provider) => sum + provider.gasSpentUsd,
      0
    );

    const weightedLeakage = netPrincipalUsd > 0
      ? (totalGasUsd / netPrincipalUsd) * 100
      : 0;

    const responsePayload = {
      address: normalizedAddress,
      chainId: targetChainId,
      lookbackDays,
      providersTouched: providerInsights.length,
      netPrincipalUsd: +netPrincipalUsd.toFixed(2),
      totalGasUsd: +totalGasUsd.toFixed(2),
      weightedLeakagePct: +weightedLeakage.toFixed(3),
      efficiencyTier:
        weightedLeakage <= 2
          ? 'optimal'
          : weightedLeakage <= 6
          ? 'monitor'
          : 'inefficient',
      providers: providerInsights,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, responsePayload, 2 * 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Validator yield leakage error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze validator yield leakage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
