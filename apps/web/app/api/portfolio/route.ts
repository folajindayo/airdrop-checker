/**
 * Portfolio API Route
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
    // Fetch portfolio data from GoldRush API
    const response = await fetch(
      `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOLDRUSH_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }

    const data = await response.json();
    return NextResponse.json(data.data.items);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

