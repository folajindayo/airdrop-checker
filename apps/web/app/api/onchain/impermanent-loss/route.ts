import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initialPrice = parseFloat(searchParams.get('initialPrice') || '0');
    const currentPrice = parseFloat(searchParams.get('currentPrice') || '0');

    if (!initialPrice || !currentPrice) {
      return NextResponse.json(
        { error: 'Initial and current prices required' },
        { status: 400 }
      );
    }

    const priceRatio = currentPrice / initialPrice;
    const impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;

    return NextResponse.json({
      success: true,
      initialPrice,
      currentPrice,
      priceChange: ((priceRatio - 1) * 100).toFixed(2) + '%',
      impermanentLoss: impermanentLoss.toFixed(2) + '%',
      severity: Math.abs(impermanentLoss) > 5 ? 'high' : Math.abs(impermanentLoss) > 2 ? 'medium' : 'low',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate IL' },
      { status: 500 }
    );
  }
}


