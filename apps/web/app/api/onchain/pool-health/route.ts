import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolAddress = searchParams.get('poolAddress');

    if (!poolAddress) {
      return NextResponse.json({ error: 'Pool address required' }, { status: 400 });
    }

    const health = {
      liquidity: Math.random() * 10000000,
      volume24h: Math.random() * 5000000,
      fees24h: Math.random() * 50000,
      utilization: Math.random() * 100,
    };

    return NextResponse.json({
      success: true,
      poolAddress,
      ...health,
      healthScore: ((health.liquidity / 1000000) * 0.4 + health.utilization * 0.6).toFixed(2),
      status: health.utilization > 80 ? 'high_risk' : health.utilization > 50 ? 'moderate' : 'healthy',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

