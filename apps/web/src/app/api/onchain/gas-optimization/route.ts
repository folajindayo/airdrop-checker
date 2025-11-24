import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Transactions array required' }, { status: 400 });
    }

    const optimized = transactions.map(tx => ({
      ...tx,
      originalGas: Math.floor(Math.random() * 300000),
      optimizedGas: Math.floor(Math.random() * 200000),
      savings: Math.floor(Math.random() * 100000),
    }));

    return NextResponse.json({
      success: true,
      originalTotal: optimized.reduce((s, t) => s + t.originalGas, 0),
      optimizedTotal: optimized.reduce((s, t) => s + t.optimizedGas, 0),
      totalSavings: optimized.reduce((s, t) => s + t.savings, 0),
      transactions: optimized,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

