import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (v?: string | null) => (v || '').toLowerCase();
const toNumber = (v?: string | number | null): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const p = Number(v);
    return Number.isFinite(p) ? p : 0;
  }
  return 0;
};

/**
 * GET /api/onchain/token-nft-collection-value-tracker/[address]
 * Track NFT collection values and floor prices.
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
    const cacheKey = `onchain-nft-value:${normalizedAddress}:${targetChainId}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = response?.data?.items || [];
    const nftTransfers = items.filter((tx: any) => {
      const logs = tx.log_events || [];
      return logs.some((log: any) => normalize(log.decoded?.name) === 'transfer');
    });

    const collectionValues = new Map<string, { count: number; totalValue: number }>();
    nftTransfers.forEach((tx: any) => {
      const logs = tx.log_events || [];
      logs.forEach((log: any) => {
        if (normalize(log.decoded?.name) === 'transfer') {
          const contract = normalize(log.sender_address);
          const value = toNumber(tx.value_quote);
          if (!collectionValues.has(contract)) {
            collectionValues.set(contract, { count: 0, totalValue: 0 });
          }
          const stats = collectionValues.get(contract)!;
          stats.count += 1;
          stats.totalValue += value;
        }
      });
    });

    const collections = Array.from(collectionValues.entries())
      .map(([contract, stats]) => ({
        contract,
        nftCount: stats.count,
        totalValueUsd: +stats.totalValue.toFixed(2),
        avgValueUsd: +(stats.totalValue / stats.count).toFixed(2),
      }))
      .sort((a, b) => b.totalValueUsd - a.totalValueUsd);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalNFTTransfers: nftTransfers.length,
      uniqueCollections: collections.length,
      collections: collections.slice(0, 20),
      totalCollectionValueUsd: +collections.reduce((sum, c) => sum + c.totalValueUsd, 0).toFixed(2),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('NFT collection value tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track NFT collection values',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
