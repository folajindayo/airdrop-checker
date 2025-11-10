import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const whaleData = generateMockWhaleData();
    return NextResponse.json(whaleData);
  } catch (error) {
    console.error('Whale tracker API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whale data' },
      { status: 500 }
    );
  }
}

function generateMockWhaleData() {
  const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'ARB', 'OP', 'UNI', 'LINK'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base'];
  const dexes = ['Uniswap', '1inch', 'Curve', 'Balancer'];

  // Generate top whales
  const topWhales = Array.from({ length: 20 }, (_, i) => {
    const address = `0x${Math.random().toString(16).slice(2, 42)}`;
    const totalValue = Math.random() * 50000000 + 5000000; // $5M-$55M
    const change24h = (Math.random() - 0.5) * 20; // -10% to +10%
    const topHoldings = tokens.sort(() => Math.random() - 0.5).slice(0, 3);
    const recentActivity = Math.floor(Math.random() * 50) + 10;
    
    const labels = ['Binance', 'Coinbase', 'Jump Trading', 'Alameda', 'Three Arrows', null, null, null];
    const label = labels[Math.floor(Math.random() * labels.length)];

    return {
      address,
      label: label || undefined,
      totalValue,
      change24h,
      topHoldings,
      recentActivity,
      isFollowing: Math.random() > 0.7,
    };
  });

  // Sort by total value
  topWhales.sort((a, b) => b.totalValue - a.totalValue);

  // Generate recent transactions
  const recentTransactions = Array.from({ length: 50 }, () => {
    const type: 'buy' | 'sell' | 'transfer' = ['buy', 'sell', 'transfer'][
      Math.floor(Math.random() * 3)
    ] as any;
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const amount = Math.random() * 1000 + 10;
    const valueUSD = amount * (token === 'ETH' ? 2500 : token === 'WBTC' ? 45000 : 1) * (Math.random() * 2 + 0.5);
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const dex = type !== 'transfer' ? dexes[Math.floor(Math.random() * dexes.length)] : undefined;

    return {
      hash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      from: topWhales[Math.floor(Math.random() * 5)].address,
      to: topWhales[Math.floor(Math.random() * 5)].address,
      type,
      token,
      amount,
      valueUSD,
      chain,
      dex,
    };
  });

  // Sort by timestamp
  recentTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Generate whale activity
  const whaleActivity = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const buys = Math.floor(Math.random() * 50) + 20;
    const sells = Math.floor(Math.random() * 40) + 15;
    const transfers = Math.floor(Math.random() * 30) + 10;

    whaleActivity.push({ date: dateStr, buys, sells, transfers });
  }

  // Generate token flow
  const tokenFlow = tokens.map((token) => {
    const netFlow = (Math.random() - 0.5) * 10000000; // -$5M to +$5M
    const whaleCount = Math.floor(Math.random() * 15) + 5;

    return {
      token,
      netFlow,
      whaleCount,
    };
  });

  // Sort by absolute net flow
  tokenFlow.sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow));

  // Get followed whales
  const followedWhales = topWhales.filter(w => w.isFollowing);

  return {
    topWhales,
    recentTransactions,
    whaleActivity,
    tokenFlow,
    followedWhales,
  };
}

