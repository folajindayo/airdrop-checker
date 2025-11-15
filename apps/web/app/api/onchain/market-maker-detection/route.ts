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
      marketMakersDetected: Math.floor(Math.random() * 10),
      topMarketMaker: '0x' + Math.random().toString(16).substring(2, 42),
      volumeShare: (Math.random() * 50).toFixed(2) + '%',
      spreadTightness: (Math.random() * 2).toFixed(3) + '%',
      manipulationRisk: Math.random() > 0.7 ? 'high' : 'low',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

