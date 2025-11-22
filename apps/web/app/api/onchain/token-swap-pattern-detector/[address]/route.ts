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

const SWAP_HINTS = ['swap', 'uniswap', 'sushiswap', 'pancake', 'exchange'];

const isSwapTransaction = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return SWAP_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-swap-pattern-detector/[address]
 * Detect swap patterns and frequencies.
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
    const cacheKey = `onchain-swap-pattern:${normalizedAddress}:${chainId || '1'}:${limit}`;
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

    const items = (response?.data?.items || []).filter(isSwapTransaction);
    const swapVolume = items.reduce((sum, tx) => sum + toNumber(tx.value_quote), 0);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalSwaps: items.length,
      totalVolumeUsd: +swapVolume.toFixed(2),
      avgSwapValueUsd: items.length > 0 ? +(swapVolume / items.length).toFixed(2) : 0,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Swap pattern detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect swap patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

