import { NextRequest, NextResponse } from 'next/server';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface GasTransaction {
  tx_hash: string;
  block_height: number;
  block_signed_at: string;
  gas_price: number;
  gas_used: number;
  gas_spent: number;
  gas_quote: number;
  chain_id: number;
  chain_name: string;
}

interface GasTrackerData {
  address: string;
  totalGasSpent: number;
  totalGasSpentUSD: number;
  chainBreakdown: Array<{
    chainId: number;
    chainName: string;
    gasSpent: number;
    gasSpentUSD: number;
    transactionCount: number;
    avgGasPrice: number;
  }>;
  recentTransactions: GasTransaction[];
  monthlyBreakdown: Array<{
    month: string;
    gasSpentUSD: number;
    transactionCount: number;
  }>;
  timestamp: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const allTransactions: GasTransaction[] = [];
    const chainStats: Record<number, {
      gasSpent: number;
      gasSpentUSD: number;
      transactionCount: number;
      totalGasPrice: number;
    }> = {};

    // Fetch transactions from all supported chains
    for (const chain of SUPPORTED_CHAINS) {
      try {
        const response = await goldrushClient.get(
          `/${chain.goldrushName}/address/${address}/transactions_v2/`,
          {
            'page-size': 100,
            'page-number': 1,
          }
        );

        if (response.data && response.data.items) {
          const txs = response.data.items.map((tx: any) => ({
            tx_hash: tx.tx_hash,
            block_height: tx.block_height,
            block_signed_at: tx.block_signed_at,
            gas_price: tx.gas_price || 0,
            gas_used: tx.gas_used || 0,
            gas_spent: tx.gas_spent || 0,
            gas_quote: tx.gas_quote || 0,
            chain_id: chain.id,
            chain_name: chain.name,
          }));

          allTransactions.push(...txs);

          // Aggregate chain stats
          if (!chainStats[chain.id]) {
            chainStats[chain.id] = {
              gasSpent: 0,
              gasSpentUSD: 0,
              transactionCount: 0,
              totalGasPrice: 0,
            };
          }

          txs.forEach((tx: GasTransaction) => {
            chainStats[chain.id].gasSpent += tx.gas_spent;
            chainStats[chain.id].gasSpentUSD += tx.gas_quote;
            chainStats[chain.id].transactionCount += 1;
            chainStats[chain.id].totalGasPrice += tx.gas_price;
          });
        }
      } catch (error) {
        console.error(`Error fetching transactions for ${chain.name}:`, error);
      }
    }

    // Calculate totals
    const totalGasSpent = Object.values(chainStats).reduce((sum, stat) => sum + stat.gasSpent, 0);
    const totalGasSpentUSD = Object.values(chainStats).reduce((sum, stat) => sum + stat.gasSpentUSD, 0);

    // Build chain breakdown
    const chainBreakdown = SUPPORTED_CHAINS.map((chain) => {
      const stats = chainStats[chain.id];
      if (!stats || stats.transactionCount === 0) {
        return null;
      }

      return {
        chainId: chain.id,
        chainName: chain.name,
        gasSpent: stats.gasSpent,
        gasSpentUSD: stats.gasSpentUSD,
        transactionCount: stats.transactionCount,
        avgGasPrice: stats.totalGasPrice / stats.transactionCount,
      };
    }).filter(Boolean) as GasTrackerData['chainBreakdown'];

    // Get recent transactions (last 50)
    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.block_signed_at).getTime() - new Date(a.block_signed_at).getTime())
      .slice(0, 50);

    // Build monthly breakdown
    const monthlyMap = new Map<string, { gasSpentUSD: number; transactionCount: number }>();
    
    allTransactions.forEach((tx) => {
      const date = new Date(tx.block_signed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { gasSpentUSD: 0, transactionCount: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData.gasSpentUSD += tx.gas_quote;
      monthData.transactionCount += 1;
    });

    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    const response: GasTrackerData = {
      address,
      totalGasSpent,
      totalGasSpentUSD,
      chainBreakdown,
      recentTransactions,
      monthlyBreakdown,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching gas tracker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gas tracker data' },
      { status: 500 }
    );
  }
}

