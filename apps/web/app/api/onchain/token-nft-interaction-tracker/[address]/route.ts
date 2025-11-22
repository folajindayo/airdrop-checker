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

const NFT_HINTS = ['nft', 'erc721', 'erc1155', 'transfer', 'mint'];

const isNFTTransaction = (tx: any) => {
  const logs = tx.log_events || [];
  return logs.some((log: any) => {
    const name = normalize(log.decoded?.name);
    return NFT_HINTS.some((hint) => name.includes(hint));
  });
};

/**
 * GET /api/onchain/token-nft-interaction-tracker/[address]
 * Track NFT interactions and transfers.
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
    const cacheKey = `onchain-nft-interaction:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
      'with-logs': true,
    });

    const items = (response?.data?.items || []).filter(isNFTTransaction);
    const nftContracts = new Set<string>();

    items.forEach((tx: any) => {
      const logs = tx.log_events || [];
      logs.forEach((log: any) => {
        if (NFT_HINTS.some((hint) => normalize(log.decoded?.name).includes(hint))) {
          nftContracts.add(normalize(log.sender_address));
        }
      });
    });

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      nftTransactions: items.length,
      uniqueNFTContracts: nftContracts.size,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('NFT interaction tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track NFT interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

