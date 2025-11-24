import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const socialData = generateMockSocialData();
    return NextResponse.json(socialData);
  } catch (error) {
    console.error('Social trading API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social trading data' },
      { status: 500 }
    );
  }
}

function generateMockSocialData() {
  const actions: ('buy' | 'sell' | 'swap')[] = ['buy', 'sell', 'swap'];
  const tokens = ['ETH', 'WBTC', 'USDC', 'ARB', 'OP', 'MATIC', 'LINK', 'UNI'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base'];

  const traderNames = [
    'CryptoWhale',
    'DeFiMaster',
    'TokenHunter',
    'YieldFarmer',
    'SmartTrader',
    'AlphaSeeker',
    'MoonShot',
    'DiamondHands',
  ];

  // Generate recent trades
  const recentTrades = Array.from({ length: 30 }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const tokenFrom = tokens[Math.floor(Math.random() * tokens.length)];
    const tokenTo = tokens.filter((t) => t !== tokenFrom)[Math.floor(Math.random() * (tokens.length - 1))];

    return {
      id: `trade-${i + 1}`,
      trader: `0x${Math.random().toString(16).slice(2, 42)}`,
      traderName: traderNames[Math.floor(Math.random() * traderNames.length)],
      action,
      tokenFrom,
      tokenTo: action === 'swap' ? tokenTo : tokenFrom,
      amount: Math.random() * 100 + 1,
      price: Math.random() * 3000 + 100,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      profit: Math.random() > 0.5 ? Math.random() * 5000 + 100 : -(Math.random() * 1000 + 50),
      chain: chains[Math.floor(Math.random() * chains.length)],
      verified: Math.random() > 0.5,
    };
  });

  // Generate top traders
  const specialties = ['DeFi', 'NFTs', 'Memecoins', 'Blue Chips', 'Yield Farming', 'Arbitrage'];

  const topTraders = Array.from({ length: 10 }, (_, i) => {
    const specialtyCount = Math.floor(Math.random() * 3) + 1;
    const traderSpecialties = specialties
      .sort(() => Math.random() - 0.5)
      .slice(0, specialtyCount);

    return {
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      name: traderNames[i % traderNames.length] + (i > 7 ? ` ${i - 7}` : ''),
      followers: Math.floor(Math.random() * 50000) + 1000,
      winRate: Math.floor(Math.random() * 30) + 60,
      totalProfit: Math.floor(Math.random() * 500000) + 10000,
      trades: Math.floor(Math.random() * 1000) + 100,
      roi: Math.floor(Math.random() * 200) + 50,
      verified: Math.random() > 0.3,
      specialty: traderSpecialties,
    };
  });

  // Sort by total profit
  topTraders.sort((a, b) => b.totalProfit - a.totalProfit);

  // Generate strategies
  const strategyNames = [
    'DCA Strategy',
    'Momentum Trading',
    'Mean Reversion',
    'Breakout Hunter',
    'Yield Maximizer',
    'Risk Parity',
  ];

  const strategyDescriptions = [
    'Dollar-cost averaging into top assets with automated rebalancing',
    'Follow strong price momentum with trailing stop losses',
    'Buy oversold assets and sell overbought positions',
    'Identify and trade breakout patterns early',
    'Optimize yield across multiple protocols automatically',
    'Balance risk across asset classes for steady returns',
  ];

  const risks: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  const strategies = strategyNames.map((name, i) => ({
    id: `strategy-${i + 1}`,
    name,
    description: strategyDescriptions[i],
    creator: traderNames[Math.floor(Math.random() * traderNames.length)],
    followers: Math.floor(Math.random() * 10000) + 500,
    performance: Math.floor(Math.random() * 150) + 20,
    risk: risks[Math.floor(Math.random() * risks.length)],
    trades: Math.floor(Math.random() * 500) + 50,
    avgReturn: Math.floor(Math.random() * 20) + 5,
  }));

  // Generate trending tokens
  const trending = tokens.map((token) => ({
    token,
    mentions: Math.floor(Math.random() * 500) + 50,
    sentiment: Math.floor(Math.random() * 100) - 50,
  }));

  // Sort by mentions
  trending.sort((a, b) => b.mentions - a.mentions);

  return {
    recentTrades,
    topTraders,
    strategies,
    trending: trending.slice(0, 8),
  };
}

