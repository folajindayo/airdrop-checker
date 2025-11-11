import { NextRequest, NextResponse } from 'next/server';
import {
  cache,
  CACHE_TTL,
  isValidAddress,
  type ProtocolInteraction,
} from '@airdrop-finder/shared';
import { fetchAllChainTransactions } from '@/lib/goldrush/transactions';
import { fetchAllChainNFTs } from '@/lib/goldrush/nfts';
import { aggregateUserActivity } from '@/lib/analyzers/activity';
import { buildProtocolInsights } from '@/lib/analyzers/protocol-insights';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `protocol-insights:${normalizedAddress}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    const [chainTransactions, chainNFTs] = await Promise.all([
      fetchAllChainTransactions(normalizedAddress),
      fetchAllChainNFTs(normalizedAddress),
    ]);

    const activity = aggregateUserActivity(
      normalizedAddress,
      chainTransactions,
      chainNFTs
    );

    const insights = buildProtocolInsights(
      normalizedAddress,
      activity.protocols as ProtocolInteraction[],
      chainTransactions
    );

    const result = {
      address: normalizedAddress,
      insights,
    };

    cache.set(cacheKey, result, CACHE_TTL.PROTOCOL_INSIGHTS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Protocol insights API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build protocol insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



