import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const analytics = generateMockGasAnalytics(address, timeRange);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Gas analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gas analytics' },
      { status: 500 }
    );
  }
}

function generateMockGasAnalytics(address: string, timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const txCount = Math.floor(Math.random() * 100) + 50;

  // Generate transactions
  const transactions = Array.from({ length: txCount }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
    const gasPrice = Math.random() * 100 + 10; // 10-110 Gwei
    const gasUsed = Math.floor(Math.random() * 200000) + 21000;
    const gasCost = (gasPrice * gasUsed) / 1e9 * 2500; // Assuming $2500 ETH

    const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon'];
    const types = ['swap', 'transfer', 'contract', 'approval', 'mint'];

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: timestamp.toISOString(),
      gasUsed,
      gasPrice,
      gasCost,
      chain: chains[Math.floor(Math.random() * chains.length)],
      type: types[Math.floor(Math.random() * types.length)],
    };
  });

  // Calculate stats
  const totalGasSpent = transactions.reduce((sum, tx) => sum + tx.gasCost, 0);
  const averageGasPrice = transactions.reduce((sum, tx) => sum + tx.gasPrice, 0) / transactions.length;
  const averageGasCost = totalGasSpent / transactions.length;
  const highestGasCost = Math.max(...transactions.map((tx) => tx.gasCost));
  const lowestGasCost = Math.min(...transactions.map((tx) => tx.gasCost));

  // Hourly pattern
  const hourlyMap: Record<number, { totalGas: number; count: number }> = {};
  transactions.forEach((tx) => {
    const hour = new Date(tx.timestamp).getHours();
    if (!hourlyMap[hour]) {
      hourlyMap[hour] = { totalGas: 0, count: 0 };
    }
    hourlyMap[hour].totalGas += tx.gasPrice;
    hourlyMap[hour].count++;
  });

  const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    avgGasPrice: hourlyMap[hour] ? hourlyMap[hour].totalGas / hourlyMap[hour].count : 0,
    txCount: hourlyMap[hour]?.count || 0,
  }));

  const bestTimeToTransact = hourlyPattern.reduce((min, curr) =>
    curr.avgGasPrice < min.avgGasPrice && curr.avgGasPrice > 0 ? curr : min
  );

  // Chain distribution
  const chainMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    chainMap[tx.chain] = (chainMap[tx.chain] || 0) + tx.gasCost;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, cost]) => ({
    chain,
    cost,
    percentage: (cost / totalGasSpent) * 100,
  }));

  const mostExpensiveChain = chainDistribution.reduce((max, curr) =>
    curr.cost > max.cost ? curr : max
  ).chain;

  // Type distribution
  const typeMap: Record<string, { cost: number; count: number }> = {};
  transactions.forEach((tx) => {
    if (!typeMap[tx.type]) {
      typeMap[tx.type] = { cost: 0, count: 0 };
    }
    typeMap[tx.type].cost += tx.gasCost;
    typeMap[tx.type].count++;
  });

  const typeDistribution = Object.entries(typeMap).map(([type, data]) => ({
    type,
    cost: data.cost,
    count: data.count,
  }));

  // Daily gas
  const dailyMap: Record<string, { cost: number; transactions: number }> = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!dailyMap[date]) {
      dailyMap[date] = { cost: 0, transactions: 0 };
    }
    dailyMap[date].cost += tx.gasCost;
    dailyMap[date].transactions++;
  });

  const dailyGas = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date,
      cost: data.cost,
      transactions: data.transactions,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date + ' 2024');
      const dateB = new Date(b.date + ' 2024');
      return dateA.getTime() - dateB.getTime();
    });

  // Monthly trend
  const monthlyMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    const month = new Date(tx.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    monthlyMap[month] = (monthlyMap[month] || 0) + tx.gasCost;
  });

  const monthlyTrend = Object.entries(monthlyMap)
    .map(([month, cost]) => ({ month, cost }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    stats: {
      totalGasSpent,
      totalTransactions: transactions.length,
      averageGasPrice,
      averageGasCost,
      highestGasCost,
      lowestGasCost,
      mostExpensiveChain,
      bestTimeToTransact: `${bestTimeToTransact.hour}:00`,
    },
    transactions,
    dailyGas,
    hourlyPattern,
    chainDistribution,
    typeDistribution,
    monthlyTrend,
  };
}

