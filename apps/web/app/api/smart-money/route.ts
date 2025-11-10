import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const smartMoneyData = generateMockSmartMoneyData();
    return NextResponse.json(smartMoneyData);
  } catch (error) {
    console.error('Smart money API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch smart money data' },
      { status: 500 }
    );
  }
}

function generateMockSmartMoneyData() {
  const tokens = ['ETH', 'PEPE', 'WIF', 'BONK', 'DOGE', 'SHIB', 'ARB', 'OP', 'MATIC', 'AVAX'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Solana'];
  const labels = ['DeFi Degen', 'Meme Lord', 'Alpha Hunter', 'Whale Watcher', null, null, null];

  // Generate top traders
  const topTraders = Array.from({ length: 50 }, (_, i) => {
    const address = `0x${Math.random().toString(16).slice(2, 42)}`;
    const winRate = Math.random() * 30 + 60; // 60-90%
    const totalTrades = Math.floor(Math.random() * 500) + 50;
    const roi = Math.random() * 500 + 50; // 50-550%
    const profitLoss = Math.random() * 1000000 + 100000; // $100k-$1.1M
    const avgHoldTime = Math.floor(Math.random() * 30) + 1; // 1-30 days
    const successfulTokens = tokens.sort(() => Math.random() - 0.5).slice(0, 5);
    const recentTrades = Math.floor(Math.random() * 100) + 20;
    const label = labels[Math.floor(Math.random() * labels.length)];
    const score = (winRate * 0.4 + Math.min(roi, 200) * 0.3 + Math.min(totalTrades / 10, 50) * 0.3);

    return {
      address,
      label: label || undefined,
      winRate,
      totalTrades,
      profitLoss,
      roi,
      avgHoldTime,
      successfulTokens,
      recentTrades,
      isFollowing: Math.random() > 0.8,
      rank: i + 1,
      score,
    };
  });

  // Sort by score
  topTraders.sort((a, b) => b.score - a.score);
  topTraders.forEach((trader, index) => {
    trader.rank = index + 1;
  });

  // Generate recent trades
  const recentTrades = Array.from({ length: 100 }, () => {
    const action: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const entryPrice = Math.random() * 100 + 0.01;
    const exitPrice = action === 'sell' ? entryPrice * (1 + Math.random() * 2) : undefined;
    const amount = Math.random() * 10000 + 100;
    const profit = exitPrice ? (exitPrice - entryPrice) * amount : undefined;
    const roi = profit ? (profit / (entryPrice * amount)) * 100 : undefined;
    const chain = chains[Math.floor(Math.random() * chains.length)];

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      token,
      action,
      entryPrice,
      exitPrice,
      amount,
      profit,
      roi,
      chain,
    };
  });

  // Sort by timestamp
  recentTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Performance metrics
  const performanceMetrics = [
    {
      metric: 'Win Rate',
      top10: topTraders.slice(0, 10).reduce((sum, t) => sum + t.winRate, 0) / 10,
      top50: topTraders.slice(0, 50).reduce((sum, t) => sum + t.winRate, 0) / 50,
    },
    {
      metric: 'Avg ROI',
      top10: topTraders.slice(0, 10).reduce((sum, t) => sum + t.roi, 0) / 10,
      top50: topTraders.slice(0, 50).reduce((sum, t) => sum + t.roi, 0) / 50,
    },
    {
      metric: 'Total Trades',
      top10: topTraders.slice(0, 10).reduce((sum, t) => sum + t.totalTrades, 0) / 10,
      top50: topTraders.slice(0, 50).reduce((sum, t) => sum + t.totalTrades, 0) / 50,
    },
  ];

  // Trending tokens
  const tokenMap: Record<string, { traders: number; totalROI: number }> = {};
  topTraders.slice(0, 20).forEach((trader) => {
    trader.successfulTokens.forEach((token) => {
      if (!tokenMap[token]) {
        tokenMap[token] = { traders: 0, totalROI: 0 };
      }
      tokenMap[token].traders++;
      tokenMap[token].totalROI += trader.roi;
    });
  });

  const trendingTokens = Object.entries(tokenMap)
    .map(([token, data]) => ({
      token,
      traders: data.traders,
      avgROI: data.totalROI / data.traders,
    }))
    .sort((a, b) => b.traders - a.traders)
    .slice(0, 6);

  // Strategy distribution
  const strategies = [
    { strategy: 'Momentum', count: 25, avgROI: 180 },
    { strategy: 'Mean Reversion', count: 15, avgROI: 120 },
    { strategy: 'Breakout', count: 20, avgROI: 200 },
    { strategy: 'Scalping', count: 30, avgROI: 90 },
    { strategy: 'Swing Trading', count: 18, avgROI: 150 },
  ];

  return {
    topTraders,
    recentTrades,
    performanceMetrics,
    trendingTokens,
    strategyDistribution: strategies,
  };
}

