import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const dayKey = (timestamp: string) => {
  const dt = new Date(timestamp);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
};

/**
 * GET /api/onchain/token-gas-spending-trend/[address]
 * Track gas spending trends over time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-gas-trend:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = response?.data?.items || [];
    const dailyGas = new Map<string, number>();

    items.forEach((tx: any) => {
      const day = dayKey(tx.block_signed_at);
      const gasUsd = toNumber(tx.gas_quote);
      dailyGas.set(day, (dailyGas.get(day) || 0) + gasUsd);
    });

    const trend = Array.from(dailyGas.entries())
      .map(([day, gas]) => ({ day, gasUsd: +gas.toFixed(4) }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const totalGas = trend.reduce((sum, d) => sum + d.gasUsd, 0);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalGasSpentUsd: +totalGas.toFixed(4),
      dailyTrend: trend,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Gas spending trend error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track gas spending trend',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

