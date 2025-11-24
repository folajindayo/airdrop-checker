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
      twitterFollowers: Math.floor(Math.random() * 100000),
      telegramMembers: Math.floor(Math.random() * 50000),
      discordMembers: Math.floor(Math.random() * 30000),
      sentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
      trending: Math.random() > 0.5,
      socialScore: Math.floor(Math.random() * 100),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

