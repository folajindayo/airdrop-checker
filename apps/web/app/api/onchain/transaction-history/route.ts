import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
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
    const address = searchParams.get('address');
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
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

    // Get transaction count (nonce) to estimate recent transactions
    const transactionCount = await publicClient.getTransactionCount({
      address: address as Address,
    });

    // Get recent blocks and filter transactions
    const latestBlock = await publicClient.getBlockNumber();
    const transactions = [];

    // Fetch transactions from recent blocks (simplified - in production use indexer)
    for (let i = 0; i < Math.min(limit, 5); i++) {
      try {
        const block = await publicClient.getBlock({
          blockNumber: latestBlock - BigInt(i),
          includeTransactions: true,
        });

        const relevantTxs = block.transactions.filter(
          (tx: any) => 
            (tx.from?.toLowerCase() === address.toLowerCase()) ||
            (tx.to?.toLowerCase() === address.toLowerCase())
        );

        transactions.push(...relevantTxs.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value?.toString() || '0',
          blockNumber: block.number.toString(),
          timestamp: block.timestamp.toString(),
        })));
      } catch (e) {
        // Continue if block fetch fails
      }
    }

    return NextResponse.json({
      success: true,
      address,
      chainId,
      transactionCount: transactionCount.toString(),
      transactions: transactions.slice(0, limit),
      totalFound: transactions.length,
      type: 'transaction_history',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}

