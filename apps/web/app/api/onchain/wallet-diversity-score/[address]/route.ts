import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    const holdings = [
      { token: 'ETH', percentage: 40 },
      { token: 'USDC', percentage: 30 },
      { token: 'UNI', percentage: 20 },
      { token: 'LINK', percentage: 10 },
    ];

    const herfindahlIndex = holdings.reduce((sum, h) => sum + Math.pow(h.percentage, 2), 0) / 100;
    const diversityScore = (100 - herfindahlIndex).toFixed(2);

    return NextResponse.json({
      success: true,
      address,
      diversityScore,
      holdings,
      recommendation: parseFloat(diversityScore) < 50 ? 'Consider diversifying' : 'Well diversified',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

