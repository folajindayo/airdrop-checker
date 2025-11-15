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


