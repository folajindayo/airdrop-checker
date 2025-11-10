import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const farmingData = generateMockFarmingData();
    return NextResponse.json(farmingData);
  } catch (error) {
    console.error('Airdrop farming API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airdrop farming data' },
      { status: 500 }
    );
  }
}

function generateMockFarmingData() {
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'zkSync', 'Starknet'];
  const categories = ['DeFi', 'NFT', 'Gaming', 'Social', 'Infrastructure', 'Bridge'];
  const statuses: ('confirmed' | 'speculative' | 'rumored')[] = ['confirmed', 'speculative', 'rumored'];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

  const strategies = [
    {
      id: 'strat-1',
      protocol: 'LayerZero',
      status: 'confirmed' as const,
      difficulty: 'medium' as const,
      estimatedValue: 5000,
      timeRequired: '2-4 weeks',
      chain: 'Multi-chain',
      category: 'Infrastructure',
      tasks: [
        {
          id: 'task-1-1',
          title: 'Bridge assets across 5+ chains',
          description: 'Use Stargate to bridge USDC/USDT across different chains',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '30 min',
        },
        {
          id: 'task-1-2',
          title: 'Interact with 10+ LayerZero protocols',
          description: 'Use protocols like Stargate, Radiant, Angle Protocol',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '2 hours',
        },
        {
          id: 'task-1-3',
          title: 'Maintain activity for 4+ weeks',
          description: 'Regular transactions to show consistent usage',
          completed: false,
          priority: 'medium' as const,
          estimatedTime: 'Ongoing',
        },
      ],
      tips: [
        'Focus on unique transaction days rather than volume',
        'Interact with multiple protocols to increase chances',
        'Consider gas costs vs potential airdrop value',
      ],
      requirements: ['Minimum $100 for bridging', 'Multiple chain wallets'],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      links: {
        website: 'https://layerzero.network',
        twitter: 'https://twitter.com/layerzero',
        docs: 'https://docs.layerzero.network',
      },
    },
    {
      id: 'strat-2',
      protocol: 'zkSync Era',
      status: 'confirmed' as const,
      difficulty: 'easy' as const,
      estimatedValue: 3000,
      timeRequired: '1-2 weeks',
      chain: 'zkSync',
      category: 'Infrastructure',
      tasks: [
        {
          id: 'task-2-1',
          title: 'Bridge to zkSync Era',
          description: 'Bridge ETH or stablecoins to zkSync Era',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '15 min',
        },
        {
          id: 'task-2-2',
          title: 'Swap on DEXes',
          description: 'Trade on SyncSwap, Mute, or SpaceFi',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '30 min',
        },
        {
          id: 'task-2-3',
          title: 'Provide liquidity',
          description: 'Add liquidity to earn fees and show commitment',
          completed: false,
          priority: 'medium' as const,
          estimatedTime: '20 min',
        },
        {
          id: 'task-2-4',
          title: 'Mint NFT',
          description: 'Mint an NFT on zkSync Era marketplace',
          completed: false,
          priority: 'low' as const,
          estimatedTime: '10 min',
        },
      ],
      tips: [
        'Complete at least 10 transactions',
        'Spread activity over multiple weeks',
        'Use different protocols for diversity',
      ],
      requirements: ['Minimum $50 for activities', 'ETH for gas fees'],
      links: {
        website: 'https://zksync.io',
        twitter: 'https://twitter.com/zksync',
      },
    },
    {
      id: 'strat-3',
      protocol: 'Scroll',
      status: 'speculative' as const,
      difficulty: 'easy' as const,
      estimatedValue: 2000,
      timeRequired: '1 week',
      chain: 'Scroll',
      category: 'Infrastructure',
      tasks: [
        {
          id: 'task-3-1',
          title: 'Bridge to Scroll',
          description: 'Use official bridge to move assets',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '15 min',
        },
        {
          id: 'task-3-2',
          title: 'Interact with DeFi protocols',
          description: 'Use Ambient, Skydrome, or other DEXes',
          completed: false,
          priority: 'high' as const,
          estimatedTime: '30 min',
        },
      ],
      tips: ['Early adoption bonus likely', 'Low competition currently'],
      requirements: ['Minimum $30 for activities'],
      links: {
        website: 'https://scroll.io',
      },
    },
  ];

  // Generate more strategies
  for (let i = 4; i <= 15; i++) {
    strategies.push({
      id: `strat-${i}`,
      protocol: `Protocol ${String.fromCharCode(64 + i)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      estimatedValue: Math.floor(Math.random() * 5000) + 500,
      timeRequired: ['1 week', '2 weeks', '1 month', '2-3 months'][Math.floor(Math.random() * 4)],
      chain: chains[Math.floor(Math.random() * chains.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      tasks: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, j) => ({
        id: `task-${i}-${j + 1}`,
        title: `Task ${j + 1}`,
        description: `Complete this task to qualify for the airdrop`,
        completed: false,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimatedTime: ['10 min', '30 min', '1 hour'][Math.floor(Math.random() * 3)],
      })),
      tips: ['Follow official announcements', 'Join community channels'],
      requirements: [`Minimum $${Math.floor(Math.random() * 100) + 20} for activities`],
      links: {
        website: 'https://example.com',
      },
    });
  }

  const stats = {
    totalStrategies: strategies.length,
    confirmedAirdrops: strategies.filter((s) => s.status === 'confirmed').length,
    estimatedValue: strategies.reduce((sum, s) => sum + s.estimatedValue, 0),
    completedTasks: 0,
    activeStrategies: strategies.filter((s) => s.status !== 'rumored').length,
  };

  const hotStrategies = strategies
    .filter((s) => s.deadline || s.status === 'confirmed')
    .slice(0, 3);

  const categoryCounts: Record<string, number> = {};
  strategies.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    stats,
    strategies,
    hotStrategies,
    categories,
  };
}

