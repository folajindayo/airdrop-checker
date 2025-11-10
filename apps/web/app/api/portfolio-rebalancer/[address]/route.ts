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

    const rebalancerData = generateMockRebalancerData(address);

    return NextResponse.json(rebalancerData);
  } catch (error) {
    console.error('Portfolio rebalancer API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio rebalancer data' },
      { status: 500 }
    );
  }
}

function generateMockRebalancerData(address: string) {
  const assets = ['ETH', 'WBTC', 'USDC', 'USDT', 'ARB', 'OP'];
  
  // Generate current portfolio
  const totalValue = Math.floor(Math.random() * 100000) + 50000;
  let remainingAllocation = 100;
  
  const currentAssets = assets.map((symbol, index) => {
    const isLast = index === assets.length - 1;
    const currentAllocation = isLast 
      ? remainingAllocation 
      : Math.floor(Math.random() * (remainingAllocation / (assets.length - index))) + 5;
    
    remainingAllocation -= currentAllocation;
    
    const currentValue = (totalValue * currentAllocation) / 100;
    const price = symbol === 'ETH' ? 2000 : symbol === 'WBTC' ? 40000 : 1;
    
    // Target allocation (slightly different from current)
    const targetAllocation = currentAllocation + (Math.random() * 10 - 5);
    const difference = targetAllocation - currentAllocation;
    const action: 'buy' | 'sell' | 'hold' = 
      difference > 0.5 ? 'buy' : difference < -0.5 ? 'sell' : 'hold';
    
    const amount = Math.abs((difference / 100) * totalValue / price);
    
    return {
      symbol,
      currentValue,
      currentAllocation,
      targetAllocation: Math.max(0, Math.min(100, targetAllocation)),
      difference,
      action,
      amount,
      price,
    };
  });

  // Normalize target allocations to sum to 100%
  const totalTarget = currentAssets.reduce((sum, a) => sum + a.targetAllocation, 0);
  currentAssets.forEach(asset => {
    asset.targetAllocation = (asset.targetAllocation / totalTarget) * 100;
    asset.difference = asset.targetAllocation - asset.currentAllocation;
  });

  // Check if rebalancing is needed
  const rebalanceNeeded = currentAssets.some(a => Math.abs(a.difference) > 2);

  // Calculate costs
  const estimatedCost = currentAssets
    .filter(a => a.action !== 'hold')
    .reduce((sum, a) => sum + (a.amount * a.price * 0.003), 0); // 0.3% fee

  // Calculate projected gains
  const projectedGains = totalValue * 0.12; // 12% annual return estimate

  // Generate strategies
  const strategies = [
    {
      name: 'Conservative',
      description: 'Low risk with stable assets and stablecoins',
      riskLevel: 'conservative' as const,
      assets: [
        { symbol: 'ETH', allocation: 30 },
        { symbol: 'WBTC', allocation: 20 },
        { symbol: 'USDC', allocation: 25 },
        { symbol: 'USDT', allocation: 25 },
      ],
      expectedReturn: 8.5,
      volatility: 15.2,
    },
    {
      name: 'Moderate',
      description: 'Balanced mix of blue chips and stablecoins',
      riskLevel: 'moderate' as const,
      assets: [
        { symbol: 'ETH', allocation: 40 },
        { symbol: 'WBTC', allocation: 25 },
        { symbol: 'USDC', allocation: 15 },
        { symbol: 'ARB', allocation: 10 },
        { symbol: 'OP', allocation: 10 },
      ],
      expectedReturn: 15.3,
      volatility: 28.7,
    },
    {
      name: 'Aggressive',
      description: 'High growth potential with Layer 2 focus',
      riskLevel: 'aggressive' as const,
      assets: [
        { symbol: 'ETH', allocation: 35 },
        { symbol: 'ARB', allocation: 25 },
        { symbol: 'OP', allocation: 25 },
        { symbol: 'WBTC', allocation: 15 },
      ],
      expectedReturn: 25.8,
      volatility: 45.3,
    },
  ];

  return {
    totalValue,
    currentAssets,
    strategies,
    rebalanceNeeded,
    estimatedCost,
    projectedGains,
  };
}

