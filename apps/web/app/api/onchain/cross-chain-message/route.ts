import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId,
      status: ['pending', 'confirmed', 'failed'][Math.floor(Math.random() * 3)],
      sourceChain: 'Ethereum',
      destinationChain: 'Arbitrum',
      blockConfirmations: Math.floor(Math.random() * 100),
      estimatedTime: Math.floor(Math.random() * 30) + ' minutes',
      fee: (Math.random() * 0.1).toFixed(4) + ' ETH',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

