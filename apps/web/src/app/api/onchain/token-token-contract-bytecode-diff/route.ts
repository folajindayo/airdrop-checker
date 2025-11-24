import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address1 = searchParams.get('address1');
    const address2 = searchParams.get('address2');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!address1 || !address2) {
      return NextResponse.json(
        { error: 'Missing required parameters: address1, address2' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const [code1, code2] = await Promise.all([
      publicClient.getBytecode({ address: address1 as Address }),
      publicClient.getBytecode({ address: address2 as Address }),
    ]);

    return NextResponse.json({
      success: true,
      address1,
      address2,
      chainId,
      bytecodeDiff: {
        isIdentical: code1 === code2,
        differences: [],
        similarity: code1 && code2 ? (code1 === code2 ? 100 : 0) : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to compare bytecode' },
      { status: 500 }
    );
  }
}

