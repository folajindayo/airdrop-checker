import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const launchData = generateMockLaunchData();
    return NextResponse.json(launchData);
  } catch (error) {
    console.error('Token launches API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token launches' },
      { status: 500 }
    );
  }
}

function generateMockLaunchData() {
  const chains = ['Ethereum', 'BSC', 'Arbitrum', 'Base', 'Solana'];
  const platforms = ['Pinksale', 'DxSale', 'Unicrypt', 'Gempad'];
  const statuses: ('upcoming' | 'live' | 'ended')[] = ['upcoming', 'live', 'ended'];

  const launches = Array.from({ length: 20 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const launchDate = status === 'upcoming' 
      ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      : status === 'live'
      ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);

    const hardCap = Math.random() * 1000000 + 100000;
    const softCap = hardCap * 0.5;
    const raised = status === 'ended' 
      ? hardCap * (Math.random() * 0.5 + 0.5)
      : status === 'live'
      ? hardCap * Math.random() * 0.8
      : 0;

    return {
      name: `Token ${String.fromCharCode(65 + i)} Project`,
      symbol: `TKN${String.fromCharCode(65 + i)}`,
      launchDate: launchDate.toISOString(),
      status,
      chain: chains[Math.floor(Math.random() * chains.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      hardCap,
      softCap,
      raised,
      participants: Math.floor(Math.random() * 5000) + 100,
      price: Math.random() * 0.1 + 0.001,
      totalSupply: Math.floor(Math.random() * 1000000000) + 100000000,
      allocation: {
        presale: 30 + Math.floor(Math.random() * 20),
        liquidity: 20 + Math.floor(Math.random() * 20),
        team: 10 + Math.floor(Math.random() * 15),
        marketing: 5 + Math.floor(Math.random() * 10),
      },
      socials: {
        website: 'https://example.com',
        twitter: 'https://twitter.com/example',
        telegram: 'https://t.me/example',
        discord: 'https://discord.gg/example',
      },
      verified: Math.random() > 0.3,
      audited: Math.random() > 0.5,
      kyc: Math.random() > 0.4,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
    };
  });

  const stats = {
    upcomingLaunches: launches.filter(l => l.status === 'upcoming').length,
    liveLaunches: launches.filter(l => l.status === 'live').length,
    totalRaised: launches.reduce((sum, l) => sum + l.raised, 0),
    avgRating: launches.reduce((sum, l) => sum + l.rating, 0) / launches.length,
  };

  const trending = launches
    .filter(l => l.status !== 'ended')
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 3);

  const recentlyLaunched = launches
    .filter(l => l.status === 'ended')
    .sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())
    .slice(0, 5);

  return {
    stats,
    launches,
    trending,
    recentlyLaunched,
  };
}

