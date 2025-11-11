import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, address } = body;

    if (!message || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: message, address' },
        { status: 400 }
      );
    }

    // Prepare message for signing
    // The actual signing happens on the client side using Reown wallet
    const messageToSign = typeof message === 'string' ? message : JSON.stringify(message);

    return NextResponse.json({
      success: true,
      message: messageToSign,
      address,
      type: 'sign_message',
      instruction: 'Use Reown wallet to sign this message',
      messageHash: null, // Will be computed by wallet
      signature: null, // Will be returned by wallet after signing
      note: 'This endpoint prepares the message for signing. Use Reown wallet SDK to actually sign it.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare message for signing' },
      { status: 500 }
    );
  }
}

