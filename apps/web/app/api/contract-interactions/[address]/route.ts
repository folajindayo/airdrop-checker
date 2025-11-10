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

    const contractData = generateMockContractData(address);

    return NextResponse.json(contractData);
  } catch (error) {
    console.error('Contract interactions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract interactions' },
      { status: 500 }
    );
  }
}

function generateMockContractData(address: string) {
  const contracts = [
    { name: 'Uniswap V3 Router', verified: true },
    { name: 'Aave Lending Pool', verified: true },
    { name: 'OpenSea Seaport', verified: true },
    { name: 'Curve Finance', verified: true },
    { name: null, verified: false },
    { name: 'GMX Vault', verified: true },
  ];

  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base'];
  const functions = ['swap', 'deposit', 'withdraw', 'approve', 'transfer', 'stake'];
  const risks: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  // Generate top contracts
  const topContracts = Array.from({ length: 20 }, (_, i) => {
    const contract = contracts[Math.floor(Math.random() * contracts.length)];
    const risk = risks[Math.floor(Math.random() * risks.length)];
    
    return {
      contract: `0x${Math.random().toString(16).slice(2, 42)}`,
      name: contract.name || undefined,
      function: functions[Math.floor(Math.random() * functions.length)],
      count: Math.floor(Math.random() * 100) + 5,
      lastInteraction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      gasSpent: Math.random() * 500 + 10,
      chain: chains[Math.floor(Math.random() * chains.length)],
      verified: contract.verified,
      risk,
    };
  });

  // Sort by count
  topContracts.sort((a, b) => b.count - a.count);

  // Generate interaction timeline
  const interactionTimeline = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const interactions = Math.floor(Math.random() * 20) + 5;
    interactionTimeline.push({ date: dateStr, interactions });
  }

  // Chain distribution
  const chainMap: Record<string, number> = {};
  topContracts.forEach((contract) => {
    chainMap[contract.chain] = (chainMap[contract.chain] || 0) + 1;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, count]) => ({
    chain,
    count,
  }));

  // Risk distribution
  const riskMap: Record<string, number> = {};
  topContracts.forEach((contract) => {
    riskMap[contract.risk] = (riskMap[contract.risk] || 0) + 1;
  });

  const riskDistribution = Object.entries(riskMap).map(([risk, count]) => ({
    risk,
    count,
  }));

  return {
    topContracts,
    contractDetails: null,
    functionCalls: [],
    interactionTimeline,
    chainDistribution,
    riskDistribution,
  };
}

