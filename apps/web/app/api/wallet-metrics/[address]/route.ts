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

    const metrics = generateMockWalletMetrics(address);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Wallet metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet metrics' },
      { status: 500 }
    );
  }
}

function generateMockWalletMetrics(address: string) {
  // Generate consistent but varied metrics based on address
  const seed = parseInt(address.slice(2, 10), 16);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  return {
    address,
    totalValue: Math.floor(random(5000, 500000)),
    nftCount: Math.floor(random(5, 200)),
    defiValue: Math.floor(random(1000, 100000)),
    transactionCount: Math.floor(random(50, 5000)),
    gasSpent: random(100, 10000),
    airdropScore: Math.floor(random(40, 95)),
    activeChains: Math.floor(random(2, 10)),
    avgDailyTx: random(1, 20),
  };
}

