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

    const bridgeData = generateMockBridgeData(address, timeRange);

    return NextResponse.json(bridgeData);
  } catch (error) {
    console.error('Bridge activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bridge activity' },
      { status: 500 }
    );
  }
}

function generateMockBridgeData(address: string, timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const bridgeCount = Math.floor(Math.random() * 50) + 20;

  const bridges = ['Stargate', 'Across', 'Hop Protocol', 'Synapse', 'Celer cBridge', 'Multichain'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'Avalanche'];
  const tokens = ['ETH', 'USDC', 'USDT', 'DAI'];
  const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed'];

  // Generate bridge transactions
  const transactions = Array.from({ length: bridgeCount }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
    const bridge = bridges[Math.floor(Math.random() * bridges.length)];
    
    const fromChain = chains[Math.floor(Math.random() * chains.length)];
    let toChain = chains[Math.floor(Math.random() * chains.length)];
    while (toChain === fromChain) {
      toChain = chains[Math.floor(Math.random() * chains.length)];
    }

    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const amount = Math.random() * 10 + 0.1;
    const valueUSD = Math.random() * 10000 + 100;
    const fee = valueUSD * (Math.random() * 0.01 + 0.001); // 0.1-1.1% fee
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = status === 'completed' ? Math.floor(Math.random() * 30) + 5 : undefined;

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: timestamp.toISOString(),
      bridge,
      fromChain,
      toChain,
      token,
      amount,
      valueUSD,
      fee,
      status,
      duration,
    };
  });

  // Calculate stats
  const completedTxs = transactions.filter(tx => tx.status === 'completed');
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.valueUSD, 0);
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
  const averageBridgeSize = totalVolume / transactions.length;
  const averageDuration = completedTxs.reduce((sum, tx) => sum + (tx.duration || 0), 0) / completedTxs.length;
  const successRate = (completedTxs.length / transactions.length) * 100;

  // Bridge distribution
  const bridgeMap: Record<string, { count: number; volume: number }> = {};
  transactions.forEach((tx) => {
    if (!bridgeMap[tx.bridge]) {
      bridgeMap[tx.bridge] = { count: 0, volume: 0 };
    }
    bridgeMap[tx.bridge].count++;
    bridgeMap[tx.bridge].volume += tx.valueUSD;
  });

  const bridgeDistribution = Object.entries(bridgeMap)
    .map(([bridge, data]) => ({
      bridge,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);

  const mostUsedBridge = bridgeDistribution[0].bridge;

  // Token distribution
  const tokenMap: Record<string, { count: number; volume: number }> = {};
  transactions.forEach((tx) => {
    if (!tokenMap[tx.token]) {
      tokenMap[tx.token] = { count: 0, volume: 0 };
    }
    tokenMap[tx.token].count++;
    tokenMap[tx.token].volume += tx.valueUSD;
  });

  const tokenDistribution = Object.entries(tokenMap)
    .map(([token, data]) => ({
      token,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);

  const mostBridgedToken = tokenDistribution[0].token;

  // Chain flow (for Sankey diagram)
  const flowMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    const key = `${tx.fromChain}-${tx.toChain}`;
    flowMap[key] = (flowMap[key] || 0) + tx.valueUSD;
  });

  const chainFlow = Object.entries(flowMap).map(([key, value]) => {
    const [source, target] = key.split('-');
    return { source, target, value };
  });

  // Daily volume
  const dailyMap: Record<string, { volume: number; bridges: number }> = {};
  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!dailyMap[date]) {
      dailyMap[date] = { volume: 0, bridges: 0 };
    }
    dailyMap[date].volume += tx.valueUSD;
    dailyMap[date].bridges++;
  });

  const dailyVolume = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date,
      volume: data.volume,
      bridges: data.bridges,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date + ' 2024');
      const dateB = new Date(b.date + ' 2024');
      return dateA.getTime() - dateB.getTime();
    });

  // Route analysis
  const routeMap: Record<string, { count: number; totalFee: number }> = {};
  transactions.forEach((tx) => {
    const route = `${tx.fromChain} → ${tx.toChain}`;
    if (!routeMap[route]) {
      routeMap[route] = { count: 0, totalFee: 0 };
    }
    routeMap[route].count++;
    routeMap[route].totalFee += tx.fee;
  });

  const routeAnalysis = Object.entries(routeMap)
    .map(([route, data]) => ({
      route,
      count: data.count,
      avgFee: data.totalFee / data.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    stats: {
      totalBridges: transactions.length,
      totalVolume,
      totalFees,
      averageBridgeSize,
      mostUsedBridge,
      mostBridgedToken,
      averageDuration,
      successRate,
    },
    transactions,
    bridgeDistribution,
    chainFlow,
    tokenDistribution,
    dailyVolume,
    routeAnalysis,
  };
}

