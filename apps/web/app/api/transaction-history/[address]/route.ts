import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { CHAINS } from '@airdrop-finder/shared';

interface TransactionAnalysis {
  chainId: number;
  chainName: string;
  totalTransactions: number;
  firstTransaction: string;
  lastTransaction: string;
  totalValueUSD: number;
  averageValueUSD: number;
  transactionTypes: Record<string, number>;
  topContracts: Array<{
    address: string;
    name: string;
    count: number;
  }>;
  activityPattern: {
    byDay: Record<string, number>;
    byHour: Record<string, number>;
    peakDay: string;
    peakHour: string;
  };
}

interface TransactionHistoryResponse {
  address: string;
  totalTransactions: number;
  totalChains: number;
  totalValueUSD: number;
  analysis: TransactionAnalysis[];
  summary: {
    mostActiveChain: string;
    mostActiveDay: string;
    mostActiveHour: string;
    averageTransactionsPerDay: number;
    transactionVelocity: number;
  };
  timestamp: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { data: TransactionHistoryResponse; expires: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `tx-history:${address.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const analysis: TransactionAnalysis[] = [];
    let totalTransactions = 0;
    let totalValueUSD = 0;

    // Fetch transaction history from all chains
    for (const chain of CHAINS) {
      try {
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        const response = await goldrushClient.get(
          `/v2/${chainName}/address/${address}/transactions_v2/`,
          {
            'quote-currency': 'USD',
            'page-size': limit,
            'page-number': 1,
          }
        );

        if (response.data?.items) {
          const transactions = response.data.items;
          const transactionTypes: Record<string, number> = {};
          const contractCounts: Record<string, { count: number; name: string }> = {};
          const byDay: Record<string, number> = {};
          const byHour: Record<string, number> = {};
          
          let chainTotalValue = 0;
          let firstTx = '';
          let lastTx = '';

          for (const tx of transactions) {
            totalTransactions++;
            
            const txDate = new Date(tx.block_signed_at);
            const dayKey = txDate.toISOString().split('T')[0];
            const hourKey = txDate.getHours().toString();
            
            byDay[dayKey] = (byDay[dayKey] || 0) + 1;
            byHour[hourKey] = (byHour[hourKey] || 0) + 1;

            if (!firstTx || tx.block_signed_at < firstTx) {
              firstTx = tx.block_signed_at;
            }
            if (!lastTx || tx.block_signed_at > lastTx) {
              lastTx = tx.block_signed_at;
            }

            const txValue = parseFloat(tx.value_quote || '0');
            chainTotalValue += txValue;
            totalValueUSD += txValue;

            const txType = tx.log_events?.length > 0 ? 'contract_interaction' : 'transfer';
            transactionTypes[txType] = (transactionTypes[txType] || 0) + 1;

            if (tx.to_address) {
              const addr = tx.to_address.toLowerCase();
              if (!contractCounts[addr]) {
                contractCounts[addr] = {
                  count: 0,
                  name: tx.to_address_label || 'Unknown',
                };
              }
              contractCounts[addr].count++;
            }
          }

          const topContracts = Object.entries(contractCounts)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)
            .map(([address, data]) => ({
              address,
              name: data.name,
              count: data.count,
            }));

          const peakDay = Object.entries(byDay).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
          const peakHour = Object.entries(byHour).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

          analysis.push({
            chainId: chain.id,
            chainName: chain.name,
            totalTransactions: transactions.length,
            firstTransaction: firstTx,
            lastTransaction: lastTx,
            totalValueUSD: chainTotalValue,
            averageValueUSD: transactions.length > 0 ? chainTotalValue / transactions.length : 0,
            transactionTypes,
            topContracts,
            activityPattern: {
              byDay,
              byHour,
              peakDay,
              peakHour,
            },
          });
        }
      } catch (error) {
        console.error(`Error fetching transaction history for ${chain.name}:`, error);
        // Continue with other chains
      }
    }

    const mostActiveChain = analysis.sort((a, b) => b.totalTransactions - a.totalTransactions)[0]?.chainName || '';
    const allDays = analysis.flatMap(a => Object.entries(a.activityPattern.byDay));
    const mostActiveDay = allDays.sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    const allHours = analysis.flatMap(a => Object.entries(a.activityPattern.byHour));
    const mostActiveHour = allHours.sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    const daysDiff = analysis.length > 0 && analysis[0].firstTransaction
      ? Math.ceil((Date.now() - new Date(analysis[0].firstTransaction).getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const averageTransactionsPerDay = daysDiff > 0 ? totalTransactions / daysDiff : 0;
    const transactionVelocity = analysis.reduce((sum, a) => sum + a.totalTransactions, 0) / Math.max(analysis.length, 1);

    const result: TransactionHistoryResponse = {
      address: address.toLowerCase(),
      totalTransactions,
      totalChains: analysis.length,
      totalValueUSD: Math.round(totalValueUSD * 100) / 100,
      analysis,
      summary: {
        mostActiveChain,
        mostActiveDay,
        mostActiveHour,
        averageTransactionsPerDay: Math.round(averageTransactionsPerDay * 100) / 100,
        transactionVelocity: Math.round(transactionVelocity * 100) / 100,
      },
      timestamp: Date.now(),
    };

    // Cache result
    cache.set(cacheKey, {
      data: result,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history', details: error.message },
      { status: 500 }
    );
  }
}

