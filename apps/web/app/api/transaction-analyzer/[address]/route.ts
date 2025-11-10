import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30d';
    const filter = searchParams.get('filter') || 'all';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const result = analyzeTransactions(address, timeRange, filter);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transaction analyzer API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transactions' },
      { status: 500 }
    );
  }
}

function analyzeTransactions(address: string, timeRange: string, filter: string) {
  // Generate mock transaction data
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const transactionCount = Math.floor(Math.random() * 200) + 50;

  // Generate transactions
  const transactions = Array.from({ length: Math.min(transactionCount, 100) }, (_, i) => {
    const types = ['send', 'receive', 'swap', 'contract'];
    const type = types[Math.floor(Math.random() * types.length)];
    const timestamp = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: timestamp.toISOString(),
      type,
      from: type === 'receive' ? `0x${Math.random().toString(16).slice(2, 42)}` : address,
      to: type === 'send' ? `0x${Math.random().toString(16).slice(2, 42)}` : address,
      value: Math.random() * 1000,
      gasUsed: Math.floor(Math.random() * 200000) + 21000,
      gasPrice: Math.random() * 50 + 10,
      status: Math.random() > 0.05 ? 'success' : 'failed',
      chainId: [1, 8453, 42161, 10, 137][Math.floor(Math.random() * 5)],
      protocol: ['Uniswap', 'Aave', '1inch', 'Curve', 'Compound'][Math.floor(Math.random() * 5)],
    };
  });

  // Calculate hourly activity
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: transactions.filter((tx) => new Date(tx.timestamp).getHours() === hour).length,
  }));

  // Calculate daily activity
  const dailyActivity = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      return txDate.toDateString() === date.toDateString();
    });

    return {
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: dayTransactions.length,
      volume: dayTransactions.reduce((sum, tx) => sum + tx.value, 0),
    };
  }).reverse();

  // Calculate type distribution
  const typeCount: Record<string, number> = {};
  transactions.forEach((tx) => {
    typeCount[tx.type] = (typeCount[tx.type] || 0) + 1;
  });

  const typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
    type,
    count,
    percentage: (count / transactions.length) * 100,
  }));

  // Calculate chain distribution
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
  };

  const chainCount: Record<string, number> = {};
  transactions.forEach((tx) => {
    const chain = chainNames[tx.chainId];
    chainCount[chain] = (chainCount[chain] || 0) + 1;
  });

  const chainDistribution = Object.entries(chainCount).map(([chain, count]) => ({
    chain,
    count,
    percentage: (count / transactions.length) * 100,
  }));

  // Calculate protocol usage
  const protocolData: Record<string, { count: number; volume: number }> = {};
  transactions.forEach((tx) => {
    if (tx.protocol) {
      if (!protocolData[tx.protocol]) {
        protocolData[tx.protocol] = { count: 0, volume: 0 };
      }
      protocolData[tx.protocol].count++;
      protocolData[tx.protocol].volume += tx.value;
    }
  });

  const protocolUsage = Object.entries(protocolData)
    .map(([protocol, data]) => ({
      protocol,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate stats
  const successfulTxs = transactions.filter((tx) => tx.status === 'success');
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.value, 0);
  const totalGasSpent = transactions.reduce((sum, tx) => sum + (tx.gasUsed * tx.gasPrice) / 1e9, 0);
  const averageGasPrice = transactions.reduce((sum, tx) => sum + tx.gasPrice, 0) / transactions.length;

  const mostActiveHour = hourlyActivity.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  ).hour;

  const dailyCounts = dailyActivity.map((d) => ({ day: d.day, count: d.count }));
  const mostActiveDay = dailyCounts.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  ).day;

  const uniqueContracts = new Set(
    transactions.filter((tx) => tx.type === 'contract').map((tx) => tx.to)
  ).size;

  const uniqueProtocols = new Set(transactions.map((tx) => tx.protocol)).size;

  return {
    transactions: transactions.slice(0, 50), // Return only recent 50
    patterns: {
      hourlyActivity,
      dailyActivity,
      typeDistribution,
      chainDistribution,
      protocolUsage,
    },
    stats: {
      totalTransactions: transactions.length,
      successRate: (successfulTxs.length / transactions.length) * 100,
      totalVolume,
      totalGasSpent,
      averageGasPrice,
      mostActiveDay,
      mostActiveHour,
      uniqueContracts,
      uniqueProtocols,
    },
  };
}

