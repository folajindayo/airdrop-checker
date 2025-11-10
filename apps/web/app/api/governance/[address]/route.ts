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

    const governanceData = generateMockGovernanceData(address);

    return NextResponse.json(governanceData);
  } catch (error) {
    console.error('Governance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch governance data' },
      { status: 500 }
    );
  }
}

function generateMockGovernanceData(address: string) {
  const protocols = ['Uniswap', 'Aave', 'Compound', 'MakerDAO', 'Curve', 'Yearn'];
  const categories = ['Treasury', 'Protocol Upgrade', 'Parameter Change', 'Grant', 'Partnership'];
  const statuses: ('active' | 'passed' | 'rejected' | 'pending')[] = [
    'active',
    'passed',
    'rejected',
    'pending',
  ];

  // Generate proposals
  const proposals = Array.from({ length: 30 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    const startDate =
      status === 'active'
        ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);

    const endDate =
      status === 'active'
        ? new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalVotes = Math.floor(Math.random() * 1000000) + 100000;
    const quorum = totalVotes * 0.4;
    const votesFor = Math.floor(Math.random() * totalVotes * 0.8);
    const votesAgainst = Math.floor(Math.random() * (totalVotes - votesFor) * 0.8);
    const votesAbstain = totalVotes - votesFor - votesAgainst;

    return {
      id: `prop-${i + 1}`,
      title: `${category}: ${protocol} Proposal ${i + 1}`,
      description: `This proposal aims to improve ${protocol} by implementing ${category.toLowerCase()} changes that will benefit the community and protocol sustainability.`,
      protocol,
      status,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      votesFor,
      votesAgainst,
      votesAbstain,
      quorum,
      totalVotes,
      category,
      proposer: `0x${Math.random().toString(16).slice(2, 42)}`,
      link: `https://snapshot.org/#/${protocol.toLowerCase()}/proposal/${i + 1}`,
    };
  });

  // Calculate stats
  const stats = {
    totalProposals: proposals.length,
    activeProposals: proposals.filter((p) => p.status === 'active').length,
    passedProposals: proposals.filter((p) => p.status === 'passed').length,
    rejectedProposals: proposals.filter((p) => p.status === 'rejected').length,
    participationRate: 65 + Math.random() * 20,
    userVotes: Math.floor(Math.random() * 50) + 10,
  };

  // User voting history
  const userVotingHistory = protocols.map((protocol) => ({
    protocol,
    votes: Math.floor(Math.random() * 20) + 1,
    votingPower: Math.floor(Math.random() * 10000) + 1000,
  }));

  // Protocol activity
  const protocolActivity = protocols.map((protocol) => ({
    protocol,
    proposals: proposals.filter((p) => p.protocol === protocol).length,
    participation: Math.floor(Math.random() * 40) + 50,
  }));

  return {
    stats,
    proposals,
    userVotingHistory,
    protocolActivity,
  };
}

