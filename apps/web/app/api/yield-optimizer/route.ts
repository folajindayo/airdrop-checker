import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const yieldData = generateMockYieldData();
    return NextResponse.json(yieldData);
  } catch (error) {
    console.error('Yield optimizer API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yield opportunities' },
      { status: 500 }
    );
  }
}

function generateMockYieldData() {
  const protocols = [
    { name: 'Aave', chains: ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon'] },
    { name: 'Compound', chains: ['Ethereum', 'Base'] },
    { name: 'Curve', chains: ['Ethereum', 'Arbitrum', 'Optimism'] },
    { name: 'Yearn', chains: ['Ethereum', 'Arbitrum'] },
    { name: 'Convex', chains: ['Ethereum'] },
    { name: 'Beefy', chains: ['Arbitrum', 'Optimism', 'Polygon'] },
    { name: 'GMX', chains: ['Arbitrum'] },
    { name: 'Velodrome', chains: ['Optimism'] },
    { name: 'Stargate', chains: ['Ethereum', 'Arbitrum', 'Optimism'] },
  ];

  const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'ARB', 'OP'];
  const risks: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  // Generate opportunities
  const topOpportunities = [];
  for (const protocol of protocols) {
    for (const chain of protocol.chains) {
      const numPools = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPools; i++) {
        const poolTokens = tokens.sort(() => Math.random() - 0.5).slice(0, 2);
        const risk = risks[Math.floor(Math.random() * risks.length)];
        const baseAPY = risk === 'low' ? 5 : risk === 'medium' ? 15 : 30;
        const apy = baseAPY + Math.random() * (risk === 'low' ? 10 : risk === 'medium' ? 20 : 50);
        const tvl = Math.random() * 100000000 + 1000000; // $1M-$101M
        const minDeposit = Math.random() * 1000 + 100;
        const lockPeriod = Math.random() > 0.6 ? Math.floor(Math.random() * 90) + 7 : undefined;
        const verified = Math.random() > 0.2;
        const audited = Math.random() > 0.3;

        topOpportunities.push({
          protocol: protocol.name,
          pool: `${poolTokens.join('/')} Pool`,
          apy,
          tvl,
          risk,
          chain,
          tokens: poolTokens,
          minDeposit,
          lockPeriod,
          rewards: poolTokens,
          verified,
          audited,
        });
      }
    }
  }

  // Sort by APY
  topOpportunities.sort((a, b) => b.apy - a.apy);

  // Generate APY trends
  const apyTrends = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const avgAPY = 15 + Math.random() * 10;
    const topAPY = 40 + Math.random() * 30;

    apyTrends.push({ date: dateStr, avgAPY, topAPY });
  }

  // Generate risk/reward data
  const riskReward = topOpportunities.slice(0, 20).map((opp) => ({
    protocol: opp.protocol,
    apy: opp.apy,
    risk: opp.risk === 'low' ? 2 + Math.random() * 2 : opp.risk === 'medium' ? 4 + Math.random() * 3 : 7 + Math.random() * 3,
    tvl: opp.tvl,
  }));

  // Chain comparison
  const chainMap: Record<string, { totalAPY: number; count: number }> = {};
  topOpportunities.forEach((opp) => {
    if (!chainMap[opp.chain]) {
      chainMap[opp.chain] = { totalAPY: 0, count: 0 };
    }
    chainMap[opp.chain].totalAPY += opp.apy;
    chainMap[opp.chain].count++;
  });

  const chainComparison = Object.entries(chainMap).map(([chain, data]) => ({
    chain,
    avgAPY: data.totalAPY / data.count,
    opportunities: data.count,
  }));

  // Yield strategies
  const strategies = [
    {
      name: 'Stable Yield Farming',
      description: 'Low-risk strategy focusing on stablecoin pools with consistent returns',
      expectedAPY: 8.5,
      risk: 'low' as const,
      protocols: ['Aave', 'Compound'],
      estimatedGas: 50,
      steps: [
        'Deposit USDC into Aave',
        'Receive aUSDC yield-bearing tokens',
        'Stake aUSDC in Curve for additional rewards',
      ],
    },
    {
      name: 'Leveraged Yield',
      description: 'Medium-risk strategy using leverage to amplify returns',
      expectedAPY: 25.3,
      risk: 'medium' as const,
      protocols: ['Aave', 'GMX'],
      estimatedGas: 120,
      steps: [
        'Supply ETH as collateral on Aave',
        'Borrow USDC at low interest',
        'Provide liquidity on GMX',
        'Earn trading fees and GMX rewards',
      ],
    },
    {
      name: 'High-Yield Farming',
      description: 'High-risk strategy targeting new protocols with high APY',
      expectedAPY: 85.7,
      risk: 'high' as const,
      protocols: ['Beefy', 'Velodrome'],
      estimatedGas: 80,
      steps: [
        'Provide liquidity to new token pairs',
        'Auto-compound rewards via Beefy vaults',
        'Monitor for impermanent loss',
      ],
    },
    {
      name: 'Cross-Chain Arbitrage',
      description: 'Medium-risk strategy exploiting yield differences across chains',
      expectedAPY: 18.2,
      risk: 'medium' as const,
      protocols: ['Stargate', 'Curve'],
      estimatedGas: 150,
      steps: [
        'Bridge assets using Stargate',
        'Provide liquidity on highest APY chain',
        'Earn bridge fees and LP rewards',
      ],
    },
  ];

  return {
    topOpportunities,
    strategies,
    apyTrends,
    riskReward,
    chainComparison,
  };
}

