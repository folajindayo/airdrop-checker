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

    const swapData = generateMockSwapData(address, timeRange);

    return NextResponse.json(swapData);
  } catch (error) {
    console.error('Swap analyzer API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap data' },
      { status: 500 }
    );
  }
}

function generateMockSwapData(address: string, timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const swapCount = Math.floor(Math.random() * 100) + 30;

  const dexes = ['Uniswap V3', 'Uniswap V2', '1inch', 'Curve', 'SushiSwap', 'PancakeSwap'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon'];
  const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'ARB', 'OP', 'MATIC'];

  // Generate swaps
  const swaps = Array.from({ length: swapCount }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
    const dex = dexes[Math.floor(Math.random() * dexes.length)];
    const chain = chains[Math.floor(Math.random() * chains.length)];
    
    const tokenIn = tokens[Math.floor(Math.random() * tokens.length)];
    let tokenOut = tokens[Math.floor(Math.random() * tokens.length)];
    while (tokenOut === tokenIn) {
      tokenOut = tokens[Math.floor(Math.random() * tokens.length)];
    }

    const amountIn = Math.random() * 10 + 0.1;
    const amountOut = amountIn * (Math.random() * 2 + 0.5);
    const valueUSD = Math.random() * 10000 + 100;
    const priceImpact = Math.random() * 5;
    const gasUsed = Math.floor(Math.random() * 150000) + 50000;
    const gasPrice = Math.random() * 50 + 10;
    const gasCost = (gasPrice * gasUsed) / 1e9 * 2500;
    const profit = Math.random() > 0.4 ? Math.random() * 500 - 100 : undefined;

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: timestamp.toISOString(),
      dex,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      valueUSD,
      priceImpact,
      gasUsed,
      gasCost,
      chain,
      profit,
    };
  });

  // Calculate stats
  const totalVolume = swaps.reduce((sum, swap) => sum + swap.valueUSD, 0);
  const totalGasSpent = swaps.reduce((sum, swap) => sum + swap.gasCost, 0);
  const averageSwapSize = totalVolume / swaps.length;
  const profitableSwaps = swaps.filter((s) => s.profit && s.profit > 0).length;
  const totalProfit = swaps.reduce((sum, swap) => sum + (swap.profit || 0), 0);

  // DEX distribution
  const dexMap: Record<string, { count: number; volume: number }> = {};
  swaps.forEach((swap) => {
    if (!dexMap[swap.dex]) {
      dexMap[swap.dex] = { count: 0, volume: 0 };
    }
    dexMap[swap.dex].count++;
    dexMap[swap.dex].volume += swap.valueUSD;
  });

  const dexDistribution = Object.entries(dexMap)
    .map(([dex, data]) => ({
      dex,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);

  const mostUsedDex = dexDistribution[0].dex;

  // Token pairs
  const pairMap: Record<string, { count: number; volume: number }> = {};
  swaps.forEach((swap) => {
    const pair = `${swap.tokenIn}/${swap.tokenOut}`;
    if (!pairMap[pair]) {
      pairMap[pair] = { count: 0, volume: 0 };
    }
    pairMap[pair].count++;
    pairMap[pair].volume += swap.valueUSD;
  });

  const tokenPairs = Object.entries(pairMap)
    .map(([pair, data]) => ({
      pair,
      count: data.count,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);

  const favoriteToken = tokens[Math.floor(Math.random() * tokens.length)];

  // Daily volume
  const dailyMap: Record<string, { volume: number; swaps: number }> = {};
  swaps.forEach((swap) => {
    const date = new Date(swap.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!dailyMap[date]) {
      dailyMap[date] = { volume: 0, swaps: 0 };
    }
    dailyMap[date].volume += swap.valueUSD;
    dailyMap[date].swaps++;
  });

  const dailyVolume = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date,
      volume: data.volume,
      swaps: data.swaps,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date + ' 2024');
      const dateB = new Date(b.date + ' 2024');
      return dateA.getTime() - dateB.getTime();
    });

  // Chain distribution
  const chainMap: Record<string, { count: number; volume: number }> = {};
  swaps.forEach((swap) => {
    if (!chainMap[swap.chain]) {
      chainMap[swap.chain] = { count: 0, volume: 0 };
    }
    chainMap[swap.chain].count++;
    chainMap[swap.chain].volume += swap.valueUSD;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, data]) => ({
    chain,
    count: data.count,
    volume: data.volume,
  }));

  // Profit/Loss timeline
  const profitLoss = dailyVolume.map((day) => ({
    date: day.date,
    profit: (Math.random() - 0.4) * 1000, // Mock P&L
  }));

  return {
    stats: {
      totalSwaps: swaps.length,
      totalVolume,
      totalGasSpent,
      averageSwapSize,
      profitableSwaps,
      totalProfit,
      mostUsedDex,
      favoriteToken,
    },
    swaps,
    dexDistribution,
    tokenPairs,
    dailyVolume,
    chainDistribution,
    profitLoss,
  };
}

