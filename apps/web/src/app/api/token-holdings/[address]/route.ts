import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const holdingsData = generateMockHoldingsData(address);

    return NextResponse.json(holdingsData);
  } catch (error) {
    console.error('Token holdings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token holdings' },
      { status: 500 }
    );
  }
}

function generateMockHoldingsData(address: string) {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png' },
    { symbol: 'ARB', name: 'Arbitrum', logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
    { symbol: 'OP', name: 'Optimism', logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
    { symbol: 'MATIC', name: 'Polygon', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    { symbol: 'UNI', name: 'Uniswap', logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
    { symbol: 'LINK', name: 'Chainlink', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
    { symbol: 'AAVE', name: 'Aave', logo: 'https://cryptologos.cc/logos/aave-aave-logo.png' },
  ];

  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon'];

  // Generate holdings
  const holdings = tokens.map((token) => {
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const balance = Math.random() * 100 + 1;
    const price = token.symbol === 'ETH' ? 2500 : 
                  token.symbol === 'WBTC' ? 45000 :
                  token.symbol === 'USDC' || token.symbol === 'USDT' ? 1 :
                  Math.random() * 100 + 1;
    const valueUSD = balance * price;
    const change24h = (Math.random() - 0.5) * 20;
    const change7d = (Math.random() - 0.5) * 40;
    const profitLoss = (Math.random() - 0.3) * valueUSD * 0.5;
    const profitLossPercent = (profitLoss / valueUSD) * 100;

    return {
      ...token,
      balance,
      valueUSD,
      price,
      change24h,
      change7d,
      chain,
      allocation: 0, // Will be calculated below
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      profitLoss,
      profitLossPercent,
    };
  });

  // Calculate total value and allocations
  const totalValue = holdings.reduce((sum, h) => sum + h.valueUSD, 0);
  holdings.forEach((holding) => {
    holding.allocation = (holding.valueUSD / totalValue) * 100;
  });

  // Sort by value
  holdings.sort((a, b) => b.valueUSD - a.valueUSD);

  // Calculate total 24h change
  const total24hChange = holdings.reduce((sum, h) => {
    return sum + (h.valueUSD / totalValue) * h.change24h;
  }, 0);

  // Chain distribution
  const chainMap: Record<string, number> = {};
  holdings.forEach((holding) => {
    chainMap[holding.chain] = (chainMap[holding.chain] || 0) + holding.valueUSD;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, value]) => ({
    chain,
    value,
    percentage: (value / totalValue) * 100,
  }));

  // Generate price history for each token
  const priceHistory: Record<string, { date: string; price: number }[]> = {};
  holdings.forEach((holding) => {
    const history = [];
    const days = 30;
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Simulate price movement
      const variance = 1 + (Math.random() - 0.5) * 0.2;
      const price = holding.price * variance;
      
      history.push({ date: dateStr, price });
    }
    priceHistory[holding.symbol] = history;
  });

  return {
    totalValue,
    totalTokens: holdings.length,
    total24hChange,
    holdings,
    chainDistribution,
    priceHistory,
  };
}

