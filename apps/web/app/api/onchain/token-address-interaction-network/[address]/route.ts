import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();

/**
 * GET /api/onchain/token-address-interaction-network/[address]
 * Build network of address interactions.
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
    const cacheKey = `onchain-interaction-network:${normalizedAddress}:${chainId || '1'}:${limit}`;
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
    const interactions = new Map<string, number>();

    items.forEach((tx: any) => {
      const from = normalize(tx.from_address);
      const to = normalize(tx.to_address);
      if (from === normalizedAddress && to) {
        interactions.set(to, (interactions.get(to) || 0) + 1);
      }
      if (to === normalizedAddress && from) {
        interactions.set(from, (interactions.get(from) || 0) + 1);
      }
    });

    const network = Array.from(interactions.entries())
      .map(([address, count]) => ({ address, interactions: count }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 20);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalInteractions: items.length,
      uniqueAddresses: interactions.size,
      topConnections: network,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Address interaction network error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build interaction network',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

