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
      totalSupply: '1000000000',
      circulatingSupply: '750000000',
      lockedSupply: '150000000',
      burnedSupply: '100000000',
      verified: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

