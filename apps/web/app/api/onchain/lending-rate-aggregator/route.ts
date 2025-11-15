import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    const protocols = [
      { name: 'Aave', supplyAPY: 3.45, borrowAPY: 5.2 },
      { name: 'Compound', supplyAPY: 3.12, borrowAPY: 5.5 },
      { name: 'Spark', supplyAPY: 3.78, borrowAPY: 4.9 },
    ];

    return NextResponse.json({
      success: true,
      tokenAddress,
      protocols,
      bestSupply: protocols.sort((a, b) => b.supplyAPY - a.supplyAPY)[0],
      bestBorrow: protocols.sort((a, b) => a.borrowAPY - b.borrowAPY)[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

