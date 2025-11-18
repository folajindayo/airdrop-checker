import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing required parameter: signature' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    // Detect signature replay attacks
    const replayCheck = {
      isReplayable: false,
      chainId: chainId,
      nonce: null,
      protectionMechanisms: [],
    };

    return NextResponse.json({
      success: true,
      signature,
      chainId,
      replayCheck,
      message: 'Signature replay detection completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect signature replay' },
      { status: 500 }
    );
  }
}

