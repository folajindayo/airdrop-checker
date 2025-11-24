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
    const tokenAddress = searchParams.get('tokenAddress');

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
            hasBalance: balance > 0n,
          };
        } catch {
          return {
            chainId: parseInt(chainId),
            chainName: chain.name,
            balance: '0',
            hasBalance: false,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      address,
      tokenAddress,
      crossChainBalances: balances,
      activeChains: balances.filter((b) => b.hasBalance).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track cross-chain tokens' },
      { status: 500 }
    );
  }
}

