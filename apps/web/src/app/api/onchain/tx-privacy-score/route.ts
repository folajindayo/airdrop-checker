import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');

    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash required' }, { status: 400 });
    }

    const privacyScore = Math.floor(Math.random() * 100);

    return NextResponse.json({
      success: true,
      txHash,
      privacyScore,
      mixerUsed: privacyScore > 70,
      relayerUsed: privacyScore > 50,
      rating: privacyScore > 70 ? 'high' : privacyScore > 40 ? 'medium' : 'low',
      recommendations: ['Use Tornado Cash', 'Consider relay services'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

