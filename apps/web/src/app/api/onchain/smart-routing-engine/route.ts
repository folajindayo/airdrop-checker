import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenIn, tokenOut, amount } = body;

    if (!tokenIn || !tokenOut || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const routes = [
      { path: [tokenIn, 'WETH', tokenOut], protocols: ['Uniswap V3'], output: amount * 1.02 },
      { path: [tokenIn, 'USDC', tokenOut], protocols: ['Curve', 'Balancer'], output: amount * 1.015 },
      { path: [tokenIn, tokenOut], protocols: ['Uniswap V2'], output: amount * 0.99 },
    ];

    const bestRoute = routes.sort((a, b) => b.output - a.output)[0];

    return NextResponse.json({
      success: true,
      tokenIn,
      tokenOut,
      amountIn: amount,
      routes,
      bestRoute,
      expectedOutput: bestRoute.output,
      priceImpact: ((bestRoute.output / amount - 1) * 100).toFixed(2) + '%',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

