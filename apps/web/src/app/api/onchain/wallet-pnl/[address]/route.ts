import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    const pnl = (Math.random() * 200000 - 50000).toFixed(2);

    return NextResponse.json({
      success: true,
      address,
      totalPnL: `$${pnl}`,
      realizedPnL: `$${(parseFloat(pnl) * 0.7).toFixed(2)}`,
      unrealizedPnL: `$${(parseFloat(pnl) * 0.3).toFixed(2)}`,
      roi: `${(Math.random() * 200 - 50).toFixed(2)}%`,
      winRate: `${(Math.random() * 100).toFixed(2)}%`,
      bestTrade: '$15,230',
      worstTrade: '-$3,420',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

