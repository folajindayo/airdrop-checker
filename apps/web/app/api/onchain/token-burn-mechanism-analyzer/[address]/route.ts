import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const toNumber = (v?: string | number | null): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const p = Number(v);
    return Number.isFinite(p) ? p : 0;
  }
  return 0;
};

/**
 * GET /api/onchain/token-burn-mechanism-analyzer/[address]
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
    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cacheKey = `onchain-${feature}:${normalizedAddress}:${targetChainId}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = response?.data?.items || [];
    const analysis = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: items.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, analysis, 60 * 1000);
    return NextResponse.json({...analysis, metadata: { version: "1.0", feature: "token-burn-mechanism-analyzer" }});
  } catch (error) {
    console.error(`${feature} error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
