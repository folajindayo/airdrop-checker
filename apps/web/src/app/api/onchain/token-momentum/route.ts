import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const rsi = Math.random() * 100;
    const macd = (Math.random() * 20 - 10).toFixed(2);

    return NextResponse.json({
      success: true,
      tokenAddress,
      rsi: rsi.toFixed(2),
      macd,
      signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
      momentum: parseFloat(macd) > 0 ? 'bullish' : 'bearish',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

