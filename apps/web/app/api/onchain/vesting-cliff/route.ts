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
      cliffPeriod: '6 months',
      cliffEndDate: '2025-06-01',
      amountLocked: '50000000',
      vestingSchedule: 'linear',
      cliffDetected: true,
      riskLevel: 'medium',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

