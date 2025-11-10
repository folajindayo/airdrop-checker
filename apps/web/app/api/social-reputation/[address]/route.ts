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

    // In production, fetch from ENS, POAP API, and credential services
    // For now, return mock data
    const data = await fetchSocialReputation(address);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Social reputation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social reputation' },
      { status: 500 }
    );
  }
}

async function fetchSocialReputation(address: string) {
  // Mock ENS profile
  const ensProfile = {
    name: 'vitalik.eth',
    avatar: 'https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000',
    description: 'Ethereum co-founder',
    twitter: 'VitalikButerin',
    github: 'vbuterin',
    website: 'https://vitalik.ca',
  };

  // Mock POAPs
  const poaps = [
    {
      id: '1',
      name: 'ETHDenver 2024',
      description: 'Attended ETHDenver 2024 conference',
      imageUrl: 'https://assets.poap.xyz/ethdenver-2024-attendee-2024-logo-1707920400627.png',
      eventDate: '2024-02-29T00:00:00Z',
      eventId: '123456',
      chain: 'gnosis',
    },
    {
      id: '2',
      name: 'DevCon VI',
      description: 'Attended DevCon VI in Bogotá',
      imageUrl: 'https://assets.poap.xyz/devcon-vi-attendee-2022-logo-1665590400627.png',
      eventDate: '2022-10-11T00:00:00Z',
      eventId: '123457',
      chain: 'gnosis',
    },
    {
      id: '3',
      name: 'EthCC[6]',
      description: 'Attended EthCC[6] in Paris',
      imageUrl: 'https://assets.poap.xyz/ethcc-6-attendee-2023-logo-1689590400627.png',
      eventDate: '2023-07-17T00:00:00Z',
      eventId: '123458',
      chain: 'gnosis',
    },
    {
      id: '4',
      name: 'Gitcoin Grants Round 18',
      description: 'Participated in Gitcoin Grants Round 18',
      imageUrl: 'https://assets.poap.xyz/gitcoin-grants-round-18-2023-logo-1689590400627.png',
      eventDate: '2023-08-15T00:00:00Z',
      eventId: '123459',
      chain: 'gnosis',
    },
    {
      id: '5',
      name: 'ETHGlobal NYC 2023',
      description: 'Participated in ETHGlobal NYC hackathon',
      imageUrl: 'https://assets.poap.xyz/ethglobal-nyc-2023-logo-1695590400627.png',
      eventDate: '2023-09-22T00:00:00Z',
      eventId: '123460',
      chain: 'gnosis',
    },
  ];

  // Mock credentials
  const credentials = [
    {
      type: 'Protocol',
      name: 'Uniswap Power User',
      issuer: 'Uniswap Labs',
      issuedDate: '2023-06-15T00:00:00Z',
      verified: true,
      description: 'Completed 100+ swaps on Uniswap',
    },
    {
      type: 'DAO',
      name: 'ENS DAO Member',
      issuer: 'ENS DAO',
      issuedDate: '2022-11-01T00:00:00Z',
      verified: true,
      description: 'Active participant in ENS governance',
    },
    {
      type: 'NFT',
      name: 'Early NFT Collector',
      issuer: 'OpenSea',
      issuedDate: '2021-03-10T00:00:00Z',
      verified: true,
      description: 'Collected NFTs before 2021',
    },
    {
      type: 'DeFi',
      name: 'Aave Liquidity Provider',
      issuer: 'Aave',
      issuedDate: '2023-01-20T00:00:00Z',
      verified: true,
      description: 'Provided liquidity on Aave protocol',
    },
    {
      type: 'Developer',
      name: 'Smart Contract Developer',
      issuer: 'Ethereum Foundation',
      issuedDate: '2022-08-05T00:00:00Z',
      verified: false,
      description: 'Deployed verified smart contracts',
    },
  ];

  // Calculate reputation scores
  const reputationScore = {
    overall: 85,
    ens: ensProfile ? 100 : 0,
    poaps: Math.min(100, poaps.length * 10),
    credentials: Math.min(100, credentials.length * 15),
    activity: 80,
  };

  // Determine badges
  const badges: string[] = [];
  if (ensProfile) badges.push('Verified');
  if (poaps.length >= 5) badges.push('NFT Collector');
  if (credentials.some((c) => c.type === 'DAO')) badges.push('DAO Member');
  if (credentials.some((c) => c.type === 'DeFi')) badges.push('DeFi User');
  if (poaps.some((p) => new Date(p.eventDate).getFullYear() <= 2021)) badges.push('Early Adopter');
  if (reputationScore.overall >= 80) badges.push('Power User');

  return {
    address,
    ensProfile,
    poaps,
    credentials,
    reputationScore,
    badges,
    followerCount: 1250,
    followingCount: 450,
    joinDate: '2021-01-15T00:00:00Z',
  };
}

