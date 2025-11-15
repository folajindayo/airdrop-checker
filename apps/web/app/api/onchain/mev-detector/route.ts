import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');
    const blockNumber = searchParams.get('blockNumber');

    if (!txHash && !blockNumber) {
      return NextResponse.json(
        { error: 'Transaction hash or block number required' },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const mevTypes = ['sandwich', 'frontrun', 'backrun', 'arbitrage'];
    const detectedType = mevTypes[Math.floor(Math.random() * mevTypes.length)];
    const probability = (Math.random() * 100).toFixed(2);


