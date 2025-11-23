import { NextRequest, NextResponse } from 'next/server';
import type { EventSignatureRequest, DecodedEvent } from '@/lib/onchain/types';

export async function POST(request: NextRequest) {
  try {
    const body: EventSignatureRequest = await request.json();
    const { eventSignature, chainId } = body;

    if (!eventSignature) {
      return NextResponse.json(
        { error: 'Missing required parameter: eventSignature' },
        { status: 400 }
      );
    }

    // Decode event signature (simplified)
    const decoded: DecodedEvent = {
      signature: eventSignature,
      name: 'Transfer',
      parameters: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'value', type: 'uint256', indexed: false },
      ],
      topics: [],
    };

    return NextResponse.json({
      success: true,
      ...decoded,
      type: 'decoded-event',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to decode event signature' },
      { status: 500 }
    );
  }
}

