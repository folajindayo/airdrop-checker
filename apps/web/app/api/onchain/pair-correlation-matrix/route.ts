import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokens = searchParams.get('tokens')?.split(',') || [];

    if (tokens.length < 2) {
      return NextResponse.json({ error: 'At least 2 tokens required' }, { status: 400 });
    }

    const matrix: any = {};
    tokens.forEach((t1) => {
      matrix[t1] = {};
      tokens.forEach((t2) => {
        matrix[t1][t2] = t1 === t2 ? 1 : (Math.random() * 2 - 1).toFixed(3);
      });
    });

    return NextResponse.json({
      success: true,
      tokens,
      correlationMatrix: matrix,
      strongestPair: [tokens[0], tokens[1]],
      correlation: 0.85,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

