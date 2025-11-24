import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tokenAddress,
      buyPressure: (Math.random() * 100).toFixed(2) + '%',
      sellPressure: (Math.random() * 100).toFixed(2) + '%',
      netFlow: (Math.random() * 2000000 - 1000000).toFixed(2),
      largeOrders: Math.floor(Math.random() * 50),
      orderBookImbalance: (Math.random() * 2 - 1).toFixed(3),
      sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

