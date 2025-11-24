import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const taxData = generateMockTaxData(address, parseInt(year));

    return NextResponse.json(taxData);
  } catch (error) {
    console.error('Tax report API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax report data' },
      { status: 500 }
    );
  }
}

function generateMockTaxData(address: string, year: number) {
  const types: ('buy' | 'sell' | 'swap' | 'income' | 'gift' | 'airdrop')[] = [
    'buy',
    'sell',
    'swap',
    'income',
    'airdrop',
  ];
  const assets = ['ETH', 'WBTC', 'USDC', 'USDT', 'ARB', 'OP', 'MATIC'];

  // Generate transactions
  const transactions = Array.from({ length: 100 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.random() * 10 + 0.1;
    const costBasis = Math.random() * 5000 + 100;
    const proceeds = type === 'sell' || type === 'swap' ? Math.random() * 6000 + 100 : 0;
    const gainLoss = proceeds - costBasis;

    const date = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    return {
      date: date.toISOString(),
      type,
      asset,
      amount,
      costBasis,
      proceeds,
      gainLoss,
      taxable: type !== 'gift',
    };
  });

  // Sort by date
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate summary
  const totalGains = transactions
    .filter((t) => t.gainLoss > 0)
    .reduce((sum, t) => sum + t.gainLoss, 0);

  const totalLosses = Math.abs(
    transactions.filter((t) => t.gainLoss < 0).reduce((sum, t) => sum + t.gainLoss, 0)
  );

  const netGainLoss = totalGains - totalLosses;

  // Calculate short-term vs long-term (simplified)
  const shortTermGains = totalGains * 0.6;
  const longTermGains = totalGains * 0.4;

  const incomeReceived = transactions
    .filter((t) => t.type === 'income' || t.type === 'airdrop')
    .reduce((sum, t) => sum + t.costBasis, 0);

  const taxableEvents = transactions.filter((t) => t.taxable).length;

  const estimatedTax = (shortTermGains * 0.24 + longTermGains * 0.15 + incomeReceived * 0.24);

  const summary = {
    totalGains,
    totalLosses,
    netGainLoss,
    shortTermGains,
    longTermGains,
    incomeReceived,
    taxableEvents,
    estimatedTax,
  };

  // Monthly breakdown
  const monthlyMap: Record<string, { gains: number; losses: number }> = {};
  transactions.forEach((tx) => {
    const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyMap[month]) {
      monthlyMap[month] = { gains: 0, losses: 0 };
    }
    if (tx.gainLoss > 0) {
      monthlyMap[month].gains += tx.gainLoss;
    } else {
      monthlyMap[month].losses += Math.abs(tx.gainLoss);
    }
  });

  const monthlyBreakdown = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    gains: data.gains,
    losses: data.losses,
  }));

  // Asset breakdown
  const assetMap: Record<string, { gainLoss: number; transactions: number }> = {};
  transactions.forEach((tx) => {
    if (!assetMap[tx.asset]) {
      assetMap[tx.asset] = { gainLoss: 0, transactions: 0 };
    }
    assetMap[tx.asset].gainLoss += tx.gainLoss;
    assetMap[tx.asset].transactions++;
  });

  const assetBreakdown = Object.entries(assetMap).map(([asset, data]) => ({
    asset,
    gainLoss: data.gainLoss,
    transactions: data.transactions,
  }));

  // Tax brackets
  const taxBrackets = [
    { bracket: '$0 - $44,625', amount: Math.min(netGainLoss, 44625), rate: 10 },
    {
      bracket: '$44,626 - $95,375',
      amount: Math.max(0, Math.min(netGainLoss - 44625, 50750)),
      rate: 12,
    },
    {
      bracket: '$95,376 - $182,100',
      amount: Math.max(0, Math.min(netGainLoss - 95375, 86725)),
      rate: 22,
    },
    { bracket: '$182,101+', amount: Math.max(0, netGainLoss - 182100), rate: 24 },
  ].filter((b) => b.amount > 0);

  return {
    summary,
    transactions,
    monthlyBreakdown,
    assetBreakdown,
    taxBrackets,
  };
}

