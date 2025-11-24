import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    const confidence = parseFloat(searchParams.get('confidence') || '95');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const volatility = Math.random() * 50 + 10;
    const var95 = (volatility * 1.65).toFixed(2);
    const var99 = (volatility * 2.33).toFixed(2);

    return NextResponse.json({
      success: true,
      tokenAddress,
      volatility: `${volatility.toFixed(2)}%`,
      var95: `${var95}%`,
      var99: `${var99}%`,
      riskLevel: volatility > 50 ? 'extreme' : volatility > 30 ? 'high' : 'moderate',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

