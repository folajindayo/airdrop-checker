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

/**
 * GET /api/onchain/token-value-flow-analyzer/[address]
 * Analyze value flow patterns.
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
    const cacheKey = `onchain-value-flow:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    let totalInflow = 0;
    let totalOutflow = 0;

    items.forEach((tx: any) => {
      const value = toNumber(tx.value_quote);
      const isIn = normalize(tx.to_address) === normalizedAddress;
      const isOut = normalize(tx.from_address) === normalizedAddress;
      if (isIn) totalInflow += value;
      if (isOut) totalOutflow += value;
    });

    const netFlow = totalInflow - totalOutflow;

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalInflowUsd: +totalInflow.toFixed(2),
      totalOutflowUsd: +totalOutflow.toFixed(2),
      netFlowUsd: +netFlow.toFixed(2),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Value flow analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze value flow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

