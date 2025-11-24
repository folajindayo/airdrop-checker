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

    const contractDetails = generateMockContractDetails(address);

    return NextResponse.json(contractDetails);
  } catch (error) {
    console.error('Contract details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract details' },
      { status: 500 }
    );
  }
}

function generateMockContractDetails(address: string) {
  const names = ['Uniswap V3 Router', 'Aave Lending Pool', 'OpenSea Seaport', 'Curve Finance', 'GMX Vault'];
  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base'];
  const risks: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const verified = Math.random() > 0.2;
  const audited = Math.random() > 0.3;
  const risk = risks[Math.floor(Math.random() * risks.length)];
  
  const riskFactorsByLevel = {
    low: ['Contract has been audited by reputable firms', 'No major vulnerabilities found'],
    medium: ['Contract uses upgradeable proxy pattern', 'Admin keys have significant control'],
    high: ['Unaudited contract', 'Complex logic with potential edge cases', 'High centralization risk'],
  };

  const functionCalls = [
    { function: 'swap', count: 45, gasAvg: 150000, successRate: 98.5 },
    { function: 'deposit', count: 32, gasAvg: 120000, successRate: 99.2 },
    { function: 'withdraw', count: 28, gasAvg: 110000, successRate: 97.8 },
    { function: 'approve', count: 15, gasAvg: 45000, successRate: 100 },
  ];

  return {
    address,
    name,
    verified,
    audited,
    deployDate: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(),
    compiler: `v0.8.${Math.floor(Math.random() * 20)}+commit.${Math.random().toString(16).slice(2, 10)}`,
    optimization: true,
    chain: chains[Math.floor(Math.random() * chains.length)],
    creator: `0x${Math.random().toString(16).slice(2, 42)}`,
    balance: Math.random() * 1000000,
    txCount: Math.floor(Math.random() * 100000) + 1000,
    uniqueUsers: Math.floor(Math.random() * 50000) + 500,
    risk,
    riskFactors: riskFactorsByLevel[risk],
    functionCalls,
  };
}

