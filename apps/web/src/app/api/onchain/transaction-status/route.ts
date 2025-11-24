import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!txHash) {
      return NextResponse.json(
        { error: 'Missing required parameter: txHash' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      return NextResponse.json({
        success: true,
        txHash,
        chainId,
        status: receipt.status === 'success' ? 'success' : 'failed',
        blockNumber: receipt.blockNumber.toString(),
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString() || '0',
        transactionIndex: receipt.transactionIndex.toString(),
        from: receipt.from,
        to: receipt.to,
        logs: receipt.logs.length,
        type: 'transaction_status',
      });
    } catch (error: any) {
      // Transaction might be pending
      try {
        const tx = await publicClient.getTransaction({
          hash: txHash as `0x${string}`,
        });

        return NextResponse.json({
          success: true,
          txHash,
          chainId,
          status: 'pending',
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gas: tx.gas.toString(),
          gasPrice: tx.gasPrice?.toString() || '0',
          nonce: tx.nonce.toString(),
          type: 'transaction_status',
        });
      } catch {
        return NextResponse.json({
          success: false,
          txHash,
          chainId,
          status: 'not_found',
          type: 'transaction_status',
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction status' },
      { status: 500 }
    );
  }
}

