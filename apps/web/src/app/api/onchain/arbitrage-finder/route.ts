import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const opportunities = [
      { path: ['Uniswap', 'Sushiswap'], profit: 0.3, gasEstimate: 180000 },
      { path: ['Curve', 'Balancer'], profit: 0.15, gasEstimate: 220000 },
    ];

    return NextResponse.json({
      success: true,
      tokenAddress,
      opportunities,
      bestOpportunity: opportunities[0],
      profitAfterGas: (opportunities[0].profit - 0.05).toFixed(2),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

