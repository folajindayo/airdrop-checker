import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const unlocks = [
      { date: '2025-12-01', amount: '5000000', recipient: 'Team' },
      { date: '2026-01-01', amount: '3000000', recipient: 'Investors' },
      { date: '2026-03-01', amount: '2000000', recipient: 'Advisors' },
    ];

    return NextResponse.json({
      success: true,
      tokenAddress,
      unlocks,
      nextUnlock: unlocks[0],
      totalUnlocking: unlocks.reduce((sum, u) => sum + parseInt(u.amount), 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

