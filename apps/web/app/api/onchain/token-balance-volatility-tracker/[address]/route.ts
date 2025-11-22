import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
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

const calculateVolatility = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * GET /api/onchain/token-balance-volatility-tracker/[address]
 * Track balance volatility over time.
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
    const cacheKey = `onchain-balance-volatility:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const balanceSnapshots = items.map((tx: any) => ({
      timestamp: tx.block_signed_at,
      valueUsd: toNumber(tx.value_quote),
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const values = balanceSnapshots.map((s) => s.valueUsd);
    const volatility = calculateVolatility(values);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const avgValue = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      snapshots: balanceSnapshots.length,
      volatility: +volatility.toFixed(4),
      maxValueUsd: +maxValue.toFixed(2),
      minValueUsd: +minValue.toFixed(2),
      avgValueUsd: +avgValue.toFixed(2),
      volatilityScore: maxValue > 0 ? +((volatility / maxValue) * 100).toFixed(2) : 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Balance volatility tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track balance volatility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
