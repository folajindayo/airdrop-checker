/**
 * Eligibility API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  try {
    // Mock airdrop eligibility data
    const airdrops = [
      {
        id: '1',
        name: 'Project Alpha',
        token: 'ALPHA',
        amount: '1000',
        eligibility: true,
        claimUrl: 'https://alpha.xyz/claim',
      },
    ];

    return NextResponse.json(airdrops);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

