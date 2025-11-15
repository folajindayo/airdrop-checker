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
      inflationRate: (Math.random() * 10).toFixed(2) + '%',
      burnRate: (Math.random() * 5).toFixed(2) + '%',
      stakingRewards: (Math.random() * 15).toFixed(2) + '%',
      velocityScore: Math.floor(Math.random() * 100),
      economicModel: Math.random() > 0.5 ? 'deflationary' : 'inflationary',
      sustainable: Math.random() > 0.3,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

