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

    // Mock DeFi positions data
    const positions = generateMockDeFiPositions(address);

    return NextResponse.json(positions);
  } catch (error) {
    console.error('DeFi positions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DeFi positions' },
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
function generateMockDeFiPositions(address: string) {
  const lending = [
    {
      protocol: 'Aave V3',
      asset: 'USDC',
      supplied: 50000,
      suppliedUSD: 50000,
      borrowed: 20000,
      borrowedUSD: 20000,
      apy: 3.25,
      healthFactor: 2.5,
      chain: 'Ethereum',
    },
    {
      protocol: 'Compound',
      asset: 'ETH',
      supplied: 10.5,
      suppliedUSD: 26250,
      borrowed: 0,
      borrowedUSD: 0,
      apy: 2.15,
      healthFactor: undefined,
      chain: 'Ethereum',
    },
    {
      protocol: 'Aave V3',
      asset: 'WBTC',
      supplied: 0.5,
      suppliedUSD: 22500,
      borrowed: 0.1,
      borrowedUSD: 4500,
      apy: 1.85,
      healthFactor: 5.0,
      chain: 'Arbitrum',
    },
  ];

  const staking = [
    {
      protocol: 'Lido',
      asset: 'stETH',
      staked: 15.2,
      stakedUSD: 38000,
      rewards: 0.125,
      rewardsUSD: 312.5,
      apy: 4.5,
      lockupEnd: undefined,
      chain: 'Ethereum',
    },
    {
      protocol: 'Rocket Pool',
      asset: 'rETH',
      staked: 8.5,
      stakedUSD: 21250,
      rewards: 0.08,
      rewardsUSD: 200,
      apy: 4.2,
      lockupEnd: undefined,
      chain: 'Ethereum',
    },
    {
      protocol: 'GMX',
      asset: 'GMX',
      staked: 250,
      stakedUSD: 15000,
      rewards: 12.5,
      rewardsUSD: 750,
      apy: 18.5,
      lockupEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      chain: 'Arbitrum',
    },
  ];

  const liquidityPools = [
    {
      protocol: 'Uniswap V3',
      pair: 'ETH/USDC',
      token0: 'ETH',
      token1: 'USDC',
      liquidity: 2.5,
      liquidityUSD: 12500,
      fees24h: 45.5,
      apr: 12.8,
      chain: 'Ethereum',
    },
    {
      protocol: 'Curve',
      pair: '3pool',
      token0: 'USDC',
      token1: 'USDT',
      liquidity: 25000,
      liquidityUSD: 25000,
      fees24h: 15.2,
      apr: 8.5,
      chain: 'Ethereum',
    },
    {
      protocol: 'Uniswap V3',
      pair: 'ARB/ETH',
      token0: 'ARB',
      token1: 'ETH',
      liquidity: 1.8,
      liquidityUSD: 9000,
      fees24h: 32.1,
      apr: 15.3,
      chain: 'Arbitrum',
    },
  ];

  const lendingValue = lending.reduce((sum, pos) => sum + pos.suppliedUSD - pos.borrowedUSD, 0);
  const stakingValue = staking.reduce((sum, pos) => sum + pos.stakedUSD, 0);
  const lpValue = liquidityPools.reduce((sum, pos) => sum + pos.liquidityUSD, 0);
  const totalValue = lendingValue + stakingValue + lpValue;
  const totalRewards = staking.reduce((sum, pos) => sum + pos.rewardsUSD, 0);

  // Protocol distribution
  const protocolMap: Record<string, number> = {};
  
  lending.forEach((pos) => {
    protocolMap[pos.protocol] = (protocolMap[pos.protocol] || 0) + pos.suppliedUSD - pos.borrowedUSD;
  });
  
  staking.forEach((pos) => {
    protocolMap[pos.protocol] = (protocolMap[pos.protocol] || 0) + pos.stakedUSD;
  });
  
  liquidityPools.forEach((pos) => {
    protocolMap[pos.protocol] = (protocolMap[pos.protocol] || 0) + pos.liquidityUSD;
  });

  const protocolDistribution = Object.entries(protocolMap).map(([protocol, value]) => ({
    protocol,
    value,
  }));

  // Chain distribution
  const chainMap: Record<string, number> = {};
  
  [...lending, ...staking, ...liquidityPools].forEach((pos: any) => {
    const value = pos.suppliedUSD 
      ? pos.suppliedUSD - (pos.borrowedUSD || 0)
      : pos.stakedUSD || pos.liquidityUSD;
    chainMap[pos.chain] = (chainMap[pos.chain] || 0) + value;
  });

  const chainDistribution = Object.entries(chainMap).map(([chain, value]) => ({
    chain,
    value,
  }));

  return {
    totalValue,
    lendingValue,
    stakingValue,
    lpValue,
    totalRewards,
    lending,
    staking,
    liquidityPools,
    protocolDistribution,
    chainDistribution,
  };
}
=======


>>>>>>> f95dd33 (feat: Add on-chain token balance checker API endpoint)
