import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '90d';

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const revenueData = generateMockRevenueData(address, timeRange);

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Protocol revenue API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol revenue' },
      { status: 500 }
    );
  }
}

function generateMockRevenueData(address: string, timeRange: string) {
  const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : 730;

  const protocols = [
    { name: 'Aave', chain: 'Ethereum', rewardToken: 'AAVE', logo: 'https://cryptologos.cc/logos/aave-aave-logo.png' },
    { name: 'Compound', chain: 'Ethereum', rewardToken: 'COMP', logo: 'https://cryptologos.cc/logos/compound-comp-logo.png' },
    { name: 'Uniswap', chain: 'Ethereum', rewardToken: 'UNI', logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png' },
    { name: 'Curve', chain: 'Ethereum', rewardToken: 'CRV', logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png' },
    { name: 'GMX', chain: 'Arbitrum', rewardToken: 'GMX' },
    { name: 'Stargate', chain: 'Optimism', rewardToken: 'STG' },
  ];

  // Generate protocol revenues
  const protocolRevenues = protocols.map((protocol) => {
    const totalEarned = Math.random() * 5000 + 500;
    const claimedRewards = totalEarned * (Math.random() * 0.4 + 0.4); // 40-80% claimed
    const pendingRewards = totalEarned - claimedRewards;
    const apr = Math.random() * 30 + 5; // 5-35% APR

    const lastClaimed = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const nextClaimable = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);

    return {
      protocol: protocol.name,
      logo: protocol.logo,
      totalEarned,
      pendingRewards,
      claimedRewards,
      apr,
      chain: protocol.chain,
      rewardToken: protocol.rewardToken,
      lastClaimed: lastClaimed.toISOString(),
      nextClaimable: nextClaimable.toISOString(),
    };
  });

  // Calculate totals
  const totalEarned = protocolRevenues.reduce((sum, p) => sum + p.totalEarned, 0);
  const totalPending = protocolRevenues.reduce((sum, p) => sum + p.pendingRewards, 0);
  const totalClaimed = protocolRevenues.reduce((sum, p) => sum + p.claimedRewards, 0);
  const averageAPR = protocolRevenues.reduce((sum, p) => sum + p.apr, 0) / protocolRevenues.length;

  // Generate history
  const history = [];
  for (let i = days; i >= 0; i -= Math.floor(days / 30)) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const earned = (totalEarned / days) * (days - i) + Math.random() * 100;
    const claimed = (totalClaimed / days) * (days - i) + Math.random() * 80;

    history.push({ date: dateStr, earned, claimed });
  }

  // Protocol distribution
  const protocolDistribution = protocolRevenues.map((p) => ({
    protocol: p.protocol,
    earned: p.totalEarned,
  }));

  // Chain distribution
  const chainMap: Record<string, number> = {};
  protocolRevenues.forEach((p) => {
    chainMap[p.chain] = (chainMap[p.chain] || 0) + p.totalEarned;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, earned]) => ({
    chain,
    earned,
  }));

  // Monthly earnings
  const monthlyEarnings = [];
  const monthsToShow = Math.min(12, Math.ceil(days / 30));
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const earnings = (totalEarned / monthsToShow) * (1 + Math.random() * 0.4 - 0.2);
    monthlyEarnings.push({ month, earnings });
  }

  return {
    totalEarned,
    totalPending,
    totalClaimed,
    averageAPR,
    protocols: protocolRevenues,
    history,
    protocolDistribution,
    chainDistribution,
    monthlyEarnings,
  };
}

