import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-airdrop-readiness/[address]
 * Score how prepared a wallet is for future airdrops
 * Uses onchain activity and diversity as simple signals
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-wallet-airdrop-readiness:${normalizedAddress}:${chainId || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const readiness: any = {
      address: normalizedAddress,
      score: 0,
      signals: {
        txCount: 0,
        uniqueProtocols: 0,
        activeChains: 0,
      },
      timestamp: Date.now(),
    };

    try {
      // Lightweight heuristic based on recent transactions
      const chainsToCheck = chainId ? [chainId] : ['1', '8453', '42161'];

      const uniqueProtocols = new Set<string>();
      let totalTx = 0;

      for (const cid of chainsToCheck) {
        const res = await goldrushClient.get(
          `/v2/${cid}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            format: 'json',
            'page-size': 25,
          }
        );

        if (res.data?.items) {
          totalTx += res.data.items.length;
          res.data.items.forEach((tx: any) => {
            if (tx.to_address_label) {
              uniqueProtocols.add(tx.to_address_label);
            }
          });
        }
      }

      readiness.signals.txCount = totalTx;
      readiness.signals.uniqueProtocols = uniqueProtocols.size;
      readiness.signals.activeChains = chainId ? 1 : 3;

      // Simple scoring model
      readiness.score =
        Math.min(40, readiness.signals.txCount) +
        Math.min(40, readiness.signals.uniqueProtocols * 2) +
        Math.min(20, readiness.signals.activeChains * 5);
    } catch (error) {
      console.error('Wallet airdrop readiness analysis error:', error);
    }

    cache.set(cacheKey, readiness, 5 * 60 * 1000);

    return NextResponse.json(readiness);
  } catch (error) {
    console.error('Wallet airdrop readiness API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze wallet airdrop readiness',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






