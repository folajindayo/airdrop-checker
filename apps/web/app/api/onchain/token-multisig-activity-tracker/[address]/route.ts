import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();

const MULTISIG_HINTS = ['multisig', 'gnosis', 'safe', 'wallet'];

const isMultisigTransaction = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return MULTISIG_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-multisig-activity-tracker/[address]
 * Track multisig wallet activity.
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
    const cacheKey = `onchain-multisig-activity:${normalizedAddress}:${chainId || '1'}:${limit}`;
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

    const items = (response?.data?.items || []).filter(isMultisigTransaction);

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      multisigTransactions: items.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Multisig activity tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track multisig activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

