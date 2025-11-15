import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const supplyChange = (Math.random() * 20 - 10).toFixed(2);
    const velocity = Math.random() * 5;

    return NextResponse.json({
      success: true,
      tokenAddress,
      supplyChange: `${supplyChange}%`,
      velocity: velocity.toFixed(2),
      shockDetected: Math.abs(parseFloat(supplyChange)) > 5,
      severity: Math.abs(parseFloat(supplyChange)) > 10 ? 'critical' : 'warning',
      impact: 'Potential price volatility expected',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

