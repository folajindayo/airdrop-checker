/**
 * Wallet Balance Aggregator
 * Aggregate token balances across multiple chains
 * GET /api/onchain/wallet-balance-aggregator/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const walletAddress = params.address as Address;
    const balances: any[] = [];

    for (const [chainId, chain] of Object.entries(chains)) {
      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        const balance = await publicClient.getBalance({
          address: walletAddress,
        });

        balances.push({
          chainId: parseInt(chainId),
          chainName: chain.name,
          balance: balance.toString(),
        });
      } catch (error) {
        // Skip failed chains
      }
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      balances,
      chainCount: balances.length,
      type: 'balance-aggregator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate balances' },
      { status: 500 }
    );
  }
}
