import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/wallet-clustering/[address]
 * Detect wallet clusters and related addresses
 * Identifies potential multi-wallet operations
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
    const cacheKey = `onchain-wallet-clustering:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? SUPPORTED_CHAINS.filter((c) => c.id === parseInt(chainId))
      : SUPPORTED_CHAINS;

    const clustering: any = {
      address: normalizedAddress,
      clusterSize: 1,
      relatedAddresses: [] as string[],
      connectionTypes: [] as string[],
      confidence: 0,
      timestamp: Date.now(),
    };

    const relatedWallets = new Set<string>();
    const connectionTypes = new Set<string>();

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 50,
          }
        );

        if (response.data?.items) {
          const transactions = response.data.items;
          
          transactions.forEach((tx: any) => {
            if (tx.from_address && tx.from_address !== normalizedAddress) {
              relatedWallets.add(tx.from_address);
              connectionTypes.add('transaction_source');
            }
            if (tx.to_address && tx.to_address !== normalizedAddress) {
              relatedWallets.add(tx.to_address);
              connectionTypes.add('transaction_destination');
            }
          });
        }
      } catch (error) {
        console.error(`Error clustering wallets on ${chain.name}:`, error);
      }
    }

    clustering.relatedAddresses = Array.from(relatedWallets).slice(0, 20);
    clustering.connectionTypes = Array.from(connectionTypes);
    clustering.clusterSize = clustering.relatedAddresses.length + 1;
    clustering.confidence = calculateConfidence(clustering);

    cache.set(cacheKey, clustering, 10 * 60 * 1000);

    return NextResponse.json(clustering);
  } catch (error) {
    console.error('Wallet clustering error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cluster wallets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateConfidence(clustering: any): number {
  const baseConfidence = Math.min(100, clustering.clusterSize * 5);
  return baseConfidence;
}

