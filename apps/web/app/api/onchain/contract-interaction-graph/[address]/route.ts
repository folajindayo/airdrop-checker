import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/contract-interaction-graph/[address]
 * Build interaction graph for wallet or contract
 * Maps relationships between addresses
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
    const cacheKey = `onchain-interaction-graph:${normalizedAddress}:${chainId || 'all'}`;
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

    const graph: any = {
      address: normalizedAddress,
      nodes: [] as any[],
      edges: [] as any[],
      totalInteractions: 0,
      timestamp: Date.now(),
    };

    const nodes = new Map<string, any>();
    const edges: any[] = [];

    nodes.set(normalizedAddress, { address: normalizedAddress, type: 'source', interactions: 0 });

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
          response.data.items.forEach((tx: any) => {
            const from = tx.from_address?.toLowerCase();
            const to = tx.to_address?.toLowerCase();

            if (from && from !== normalizedAddress) {
              if (!nodes.has(from)) {
                nodes.set(from, { address: from, type: 'contract', interactions: 0 });
              }
              nodes.get(from).interactions++;
            }

            if (to && to !== normalizedAddress) {
              if (!nodes.has(to)) {
                nodes.set(to, { address: to, type: 'contract', interactions: 0 });
              }
              nodes.get(to).interactions++;
            }

            if (from && to) {
              edges.push({
                from: from === normalizedAddress ? normalizedAddress : from,
                to: to === normalizedAddress ? normalizedAddress : to,
                value: parseFloat(tx.value_quote || '0'),
              });
            }

            graph.totalInteractions++;
          });
        }
      } catch (error) {
        console.error(`Error building graph on ${chain.name}:`, error);
      }
    }

    graph.nodes = Array.from(nodes.values()).slice(0, 50);
    graph.edges = edges.slice(0, 100);

    cache.set(cacheKey, graph, 5 * 60 * 1000);

    return NextResponse.json(graph);
  } catch (error) {
    console.error('Interaction graph error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build interaction graph',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

