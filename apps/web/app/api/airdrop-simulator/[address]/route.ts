import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const multiplier = parseFloat(searchParams.get('multiplier') || '1');
    const pricing = searchParams.get('pricing') || 'moderate';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const result = simulateAirdrops(address, multiplier, pricing as 'conservative' | 'moderate' | 'optimistic');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Airdrop simulator API error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}

function simulateAirdrops(
  address: string,
  multiplier: number,
  pricing: 'conservative' | 'moderate' | 'optimistic'
) {
  // Price multipliers based on assumption
  const priceMultipliers = {
    conservative: 0.5,
    moderate: 1.0,
    optimistic: 2.0,
  };

  const priceMultiplier = priceMultipliers[pricing];

  // Mock airdrop estimates
  const airdrops = [
    {
      projectId: 'layerzero',
      projectName: 'LayerZero',
      probability: Math.min(95, 75 * multiplier),
      estimatedTokens: Math.round(500 * multiplier),
      baseValue: 2500,
      reasoning: [
        'Active cross-chain transactions detected',
        'Used multiple LayerZero-enabled protocols',
        'Early adopter of omnichain technology',
        'High transaction volume across chains',
      ],
      confidence: 'high' as const,
    },
    {
      projectId: 'scroll',
      projectName: 'Scroll',
      probability: Math.min(90, 70 * multiplier),
      estimatedTokens: Math.round(800 * multiplier),
      baseValue: 3200,
      reasoning: [
        'Deployed contracts on Scroll testnet',
        'Active participation in Scroll ecosystem',
        'Early mainnet transactions',
      ],
      confidence: 'high' as const,
    },
    {
      projectId: 'zksync',
      projectName: 'zkSync Era',
      probability: Math.min(85, 65 * multiplier),
      estimatedTokens: Math.round(1200 * multiplier),
      baseValue: 4800,
      reasoning: [
        'Regular zkSync Era transactions',
        'Interacted with native DeFi protocols',
        'Bridged assets to zkSync',
        'NFT minting activity on zkSync',
      ],
      confidence: 'high' as const,
    },
    {
      projectId: 'linea',
      projectName: 'Linea',
      probability: Math.min(80, 60 * multiplier),
      estimatedTokens: Math.round(600 * multiplier),
      baseValue: 2400,
      reasoning: [
        'Participated in Linea Voyage campaigns',
        'Active wallet on Linea mainnet',
        'Used multiple Linea dApps',
      ],
      confidence: 'medium' as const,
    },
    {
      projectId: 'metamask',
      projectName: 'MetaMask',
      probability: Math.min(75, 55 * multiplier),
      estimatedTokens: Math.round(400 * multiplier),
      baseValue: 2000,
      reasoning: [
        'Long-term MetaMask user',
        'Used MetaMask Swaps feature',
        'Active across multiple networks',
      ],
      confidence: 'medium' as const,
    },
    {
      projectId: 'polyhedra',
      projectName: 'Polyhedra Network',
      probability: Math.min(70, 50 * multiplier),
      estimatedTokens: Math.round(300 * multiplier),
      baseValue: 1500,
      reasoning: [
        'Used zkBridge for cross-chain transfers',
        'Early testnet participant',
        'Multiple bridge transactions',
      ],
      confidence: 'medium' as const,
    },
    {
      projectId: 'eigenlayer',
      projectName: 'EigenLayer',
      probability: Math.min(65, 45 * multiplier),
      estimatedTokens: Math.round(250 * multiplier),
      baseValue: 1250,
      reasoning: [
        'Restaked ETH on EigenLayer',
        'Participated in AVS ecosystem',
        'Early protocol adopter',
      ],
      confidence: 'medium' as const,
    },
    {
      projectId: 'blast',
      projectName: 'Blast',
      probability: Math.min(60, 40 * multiplier),
      estimatedTokens: Math.round(700 * multiplier),
      baseValue: 2800,
      reasoning: [
        'Deposited assets during Blast Phase 1',
        'Active on Blast mainnet',
        'Earned Blast Gold points',
      ],
      confidence: 'low' as const,
    },
    {
      projectId: 'manta',
      projectName: 'Manta Pacific',
      probability: Math.min(55, 35 * multiplier),
      estimatedTokens: Math.round(350 * multiplier),
      baseValue: 1400,
      reasoning: [
        'Bridged to Manta Pacific',
        'Used Manta DeFi protocols',
        'NFT activity on Manta',
      ],
      confidence: 'low' as const,
    },
    {
      projectId: 'mode',
      projectName: 'Mode Network',
      probability: Math.min(50, 30 * multiplier),
      estimatedTokens: Math.round(450 * multiplier),
      baseValue: 1800,
      reasoning: [
        'Early Mode Network user',
        'Participated in Mode campaigns',
        'Active DeFi participation',
      ],
      confidence: 'low' as const,
    },
  ];

  // Calculate estimated values with price multiplier
  const estimatedAirdrops = airdrops.map((airdrop) => ({
    ...airdrop,
    estimatedValue: airdrop.baseValue * priceMultiplier,
  }));

  // Calculate totals
  const totalEstimatedValue = estimatedAirdrops.reduce((sum, a) => sum + a.estimatedValue, 0);
  const bestCase = totalEstimatedValue * 1.5; // 50% upside
  const worstCase = totalEstimatedValue * 0.3; // 70% downside
  const averageCase = totalEstimatedValue;

  // Generate potential gains timeline
  const potentialGains = [
    { timeframe: '1 Month', value: Math.round(totalEstimatedValue * 0.2) },
    { timeframe: '3 Months', value: Math.round(totalEstimatedValue * 0.5) },
    { timeframe: '6 Months', value: Math.round(totalEstimatedValue * 0.8) },
    { timeframe: '1 Year', value: Math.round(totalEstimatedValue) },
  ];

  // Generate recommendations
  const recommendations = [
    'Increase cross-chain activity to qualify for more bridge and L2 airdrops',
    'Participate in testnet campaigns for upcoming protocols',
    'Maintain consistent activity across multiple chains',
    'Engage with governance and community initiatives',
    'Use new protocols early to maximize airdrop potential',
    'Bridge assets to emerging L2s and L3s',
    'Mint NFTs and participate in on-chain events',
    'Provide liquidity on new DEXs and lending protocols',
  ];

  // Filter recommendations based on multiplier
  const filteredRecommendations = multiplier < 1.5
    ? recommendations
    : recommendations.slice(0, 5);

  return {
    totalEstimatedValue: Math.round(totalEstimatedValue),
    bestCase: Math.round(bestCase),
    worstCase: Math.round(worstCase),
    averageCase: Math.round(averageCase),
    airdrops: estimatedAirdrops,
    recommendations: filteredRecommendations,
    potentialGains,
  };
}

