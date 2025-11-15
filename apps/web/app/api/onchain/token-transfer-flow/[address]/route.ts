import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transfer-flow/[address]
 * Analyze token transfer flows and patterns
 * Tracks incoming and outgoing transfers using Reown data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-transfer-flow:${normalizedAddress}:${chainId || 'all'}:${days}`;
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

    const flow: any = {
      address: normalizedAddress,
      period: `${days} days`,
      incoming: {
        totalValueUSD: 0,
        totalTransactions: 0,
        topSources: [] as any[],
        byToken: {} as Record<string, any>,
      },
      outgoing: {
        totalValueUSD: 0,
        totalTransactions: 0,
        topDestinations: [] as any[],
        byToken: {} as Record<string, any>,
      },
      netFlow: 0,
      patterns: {
        isNetReceiver: false,
        isNetSender: false,
        averageIncoming: 0,
        averageOutgoing: 0,
      },
      timestamp: Date.now(),
    };

    const incomingSources = new Map<string, number>();
    const outgoingDestinations = new Map<string, number>();
    const incomingByToken = new Map<string, number>();
    const outgoingByToken = new Map<string, number>();

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
          }
        );

        if (response.data?.items) {
          const transactions = response.data.items;

          transactions.forEach((tx: any) => {
            const txDate = new Date(tx.block_signed_at);
            const daysAgo = (Date.now() - txDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysAgo > days) return;

            const value = parseFloat(tx.value_quote || '0');
            const tokenAddress = tx.to_address === normalizedAddress 
              ? (tx.log_events?.[0]?.sender_address || 'native')
              : 'unknown';

            if (tx.to_address === normalizedAddress && tx.from_address !== normalizedAddress) {
              flow.incoming.totalValueUSD += value;
              flow.incoming.totalTransactions++;
              
              if (tx.from_address) {
                incomingSources.set(tx.from_address, 
                  (incomingSources.get(tx.from_address) || 0) + value);
              }
              
              incomingByToken.set(tokenAddress, 
                (incomingByToken.get(tokenAddress) || 0) + value);
            } else if (tx.from_address === normalizedAddress && tx.to_address !== normalizedAddress) {
              flow.outgoing.totalValueUSD += value;
              flow.outgoing.totalTransactions++;
              
              if (tx.to_address) {
                outgoingDestinations.set(tx.to_address, 
                  (outgoingDestinations.get(tx.to_address) || 0) + value);
              }
              
              outgoingByToken.set(tokenAddress, 
                (outgoingByToken.get(tokenAddress) || 0) + value);
            }
          });
        }
      } catch (error) {
        console.error(`Error analyzing transfer flow on ${chain.name}:`, error);
      }
    }

    flow.incoming.topSources = Array.from(incomingSources.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, value]) => ({ address, valueUSD: value }));

    flow.outgoing.topDestinations = Array.from(outgoingDestinations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([address, value]) => ({ address, valueUSD: value }));

    flow.incoming.byToken = Object.fromEntries(
      Array.from(incomingByToken.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    );

    flow.outgoing.byToken = Object.fromEntries(
      Array.from(outgoingByToken.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    );

    flow.netFlow = flow.incoming.totalValueUSD - flow.outgoing.totalValueUSD;
    flow.patterns.isNetReceiver = flow.netFlow > 0;
    flow.patterns.isNetSender = flow.netFlow < 0;
    flow.patterns.averageIncoming = flow.incoming.totalTransactions > 0
      ? flow.incoming.totalValueUSD / flow.incoming.totalTransactions
      : 0;
    flow.patterns.averageOutgoing = flow.outgoing.totalTransactions > 0
      ? flow.outgoing.totalValueUSD / flow.outgoing.totalTransactions
      : 0;

    cache.set(cacheKey, flow, 5 * 60 * 1000);

    return NextResponse.json(flow);
  } catch (error) {
    console.error('Token transfer flow analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transfer flow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

