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

    const mevData = generateMockMEVData(address);

    return NextResponse.json(mevData);
  } catch (error) {
    console.error('MEV protection API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MEV protection data' },
      { status: 500 }
    );
  }
}

function generateMockMEVData(address: string) {
  const attackTypes: ('sandwich' | 'frontrun' | 'backrun' | 'liquidation')[] = [
    'sandwich',
    'frontrun',
    'backrun',
    'liquidation',
  ];
  const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'DAI'];

  // Generate recent attacks
  const recentAttacks = Array.from({ length: 15 }, (_, i) => {
    const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const protected = Math.random() > 0.4;
    const lossAmount = Math.random() * 500 + 10;

    return {
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      type,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lossAmount,
      token: tokens[Math.floor(Math.random() * tokens.length)],
      attacker: `0x${Math.random().toString(16).slice(2, 42)}`,
      protected,
    };
  });

  // Calculate stats
  const totalAttacks = recentAttacks.length;
  const blockedAttacks = recentAttacks.filter((a) => a.protected).length;
  const totalLoss = recentAttacks
    .filter((a) => !a.protected)
    .reduce((sum, a) => sum + a.lossAmount, 0);
  const savedAmount = recentAttacks
    .filter((a) => a.protected)
    .reduce((sum, a) => sum + a.lossAmount, 0);
  const protectionRate = (blockedAttacks / totalAttacks) * 100;

  const stats = {
    totalAttacks,
    blockedAttacks,
    totalLoss,
    savedAmount,
    protectionRate,
  };

  // Attacks by type
  const attackTypeMap: Record<string, { count: number; loss: number }> = {};
  recentAttacks.forEach((attack) => {
    if (!attackTypeMap[attack.type]) {
      attackTypeMap[attack.type] = { count: 0, loss: 0 };
    }
    attackTypeMap[attack.type].count++;
    if (!attack.protected) {
      attackTypeMap[attack.type].loss += attack.lossAmount;
    }
  });

  const attacksByType = Object.entries(attackTypeMap).map(([type, data]) => ({
    type,
    count: data.count,
    loss: data.loss,
  }));

  // Timeline
  const timeline = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const attacks = Math.floor(Math.random() * 5);
    const losses = attacks * (Math.random() * 100 + 20);

    timeline.push({ date: dateStr, attacks, losses });
  }

  // Top attackers
  const attackerMap: Record<string, { attacks: number; profit: number }> = {};
  recentAttacks.forEach((attack) => {
    if (!attackerMap[attack.attacker]) {
      attackerMap[attack.attacker] = { attacks: 0, profit: 0 };
    }
    attackerMap[attack.attacker].attacks++;
    if (!attack.protected) {
      attackerMap[attack.attacker].profit += attack.lossAmount;
    }
  });

  const topAttackers = Object.entries(attackerMap)
    .map(([address, data]) => ({
      address,
      attacks: data.attacks,
      profit: data.profit,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Recommendations
  const recommendations = [
    'Use private RPC endpoints to hide transactions from public mempool',
    'Enable MEV protection on supported DEXes (e.g., CowSwap, 1inch Fusion)',
    'Set appropriate slippage tolerance (0.5-1% for stablecoins, 2-5% for volatile tokens)',
    'Split large trades into smaller chunks to reduce MEV impact',
    'Use Flashbots Protect RPC for sensitive transactions',
    'Monitor gas prices and avoid trading during high congestion',
  ];

  return {
    stats,
    recentAttacks: recentAttacks.slice(0, 10),
    attacksByType,
    timeline,
    topAttackers,
    recommendations,
  };
}

