import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/transaction-history/[address]
 * Analyze transaction history patterns for a wallet
 * Uses GoldRush API for transaction data
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
    const cacheKey = `onchain-tx-history:${normalizedAddress}:${chainId || 'all'}:${days}`;
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

    const transactions: any[] = [];
    const analysis = {
      totalTransactions: 0,
      totalValue: 0,
      averageValue: 0,
      transactionTypes: {} as Record<string, number>,
      mostActiveDay: '',
      mostActiveHour: 0,
      uniqueContracts: new Set<string>(),
      gasSpent: 0,
      firstTransaction: null as any,
      lastTransaction: null as any,
    };

    for (const chain of targetChains) {
      try {
        const response = await goldrushClient.get(
          `/v2/${chain.id}/address/${normalizedAddress}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'format': 'json',
            'page-size': 100,
            'block-signed-at-asc': 'false',
          }
        );

        if (response.data?.items) {
          const items = response.data.items;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);

          items.forEach((tx: any) => {
            const txDate = new Date(tx.block_signed_at);
            if (txDate >= cutoffDate) {
              transactions.push({
                chainId: chain.id,
                chainName: chain.name,
                ...tx,
              });

              analysis.totalTransactions += 1;
              if (tx.value_quote) {
                analysis.totalValue += tx.value_quote;
              }
              if (tx.gas_spent) {
                analysis.gasSpent += tx.gas_spent;
              }

              // Track transaction types
              const txType = tx.log_events?.length > 0 ? 'contract_interaction' : 'transfer';
              analysis.transactionTypes[txType] = (analysis.transactionTypes[txType] || 0) + 1;

              // Track unique contracts
              if (tx.to_address) {
                analysis.uniqueContracts.add(tx.to_address.toLowerCase());
              }

              // Track first and last transactions
              if (!analysis.firstTransaction || txDate < new Date(analysis.firstTransaction.block_signed_at)) {
                analysis.firstTransaction = tx;
              }
              if (!analysis.lastTransaction || txDate > new Date(analysis.lastTransaction.block_signed_at)) {
                analysis.lastTransaction = tx;
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching transactions on ${chain.name}:`, error);
      }
    }

    // Calculate patterns
    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};

    transactions.forEach((tx) => {
      const date = new Date(tx.block_signed_at);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayCounts[day] = (dayCounts[day] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    analysis.mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    analysis.mostActiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    analysis.averageValue = analysis.totalTransactions > 0 ? analysis.totalValue / analysis.totalTransactions : 0;

    const result = {
      address: normalizedAddress,
      transactions: transactions.slice(0, 100), // Limit to 100 most recent
      analysis: {
        ...analysis,
        uniqueContractsCount: analysis.uniqueContracts.size,
        uniqueContracts: Array.from(analysis.uniqueContracts),
      },
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain transaction history API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

