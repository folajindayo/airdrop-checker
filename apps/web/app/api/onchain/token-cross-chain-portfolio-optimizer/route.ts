import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
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

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    const balances = await Promise.all(
      Object.entries(chains).map(async ([chainId, chain]) => {
        try {
          const publicClient = createPublicClient({
            chain,
            transport: http(),
          });

          const balance = await publicClient.getBalance({
            address: address as Address,
          });

          return {
            chainId: parseInt(chainId),
            chainName: chain.name,
            balance: balance.toString(),
          };
        } catch {
          return {
            chainId: parseInt(chainId),
            chainName: chain.name,
            balance: '0',
          };
        }
      })
    );

    const totalValue = balances.reduce(
      (sum, b) => sum + BigInt(b.balance),
      0n
    );

    return NextResponse.json({
      success: true,
      address,
      portfolioOptimization: {
        chains: balances,
        totalValue: totalValue.toString(),
        recommendedAllocation: balances.map((b) => ({
          chain: b.chainName,
          allocation: Number((BigInt(b.balance) * 100n) / totalValue),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to optimize cross-chain portfolio' },
      { status: 500 }
    );
  }
}

