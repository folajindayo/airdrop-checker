import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    const optimizations = [
      { type: 'Batch transactions', savings: '45%' },
      { type: 'Use Layer 2', savings: '80%' },
      { type: 'Off-peak timing', savings: '30%' },
    ];

    return NextResponse.json({
      success: true,
      address,
      currentGasSpent: '2.5 ETH',
      potentialSavings: '1.8 ETH',
      optimizations,
      recommendation: optimizations[1],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

