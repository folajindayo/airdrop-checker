/**
 * Multi-Chain Token Balance Aggregator
 * Aggregate token balances across multiple chains
 * GET /api/onchain/multi-chain-token-balance/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress') as Address;
    const walletAddress = params.address as Address;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    const balances: any[] = [];

    for (const [chainId, chain] of Object.entries(chains)) {
      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        const balance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [walletAddress],
        });

        balances.push({
          chainId: parseInt(chainId),
          chainName: chain.name,
          balance: balance.toString(),
        });
      } catch (error) {
        // Skip chains where token doesn't exist
      }
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      tokenAddress,
      balances,
      totalChains: balances.length,
      type: 'multi-chain-balance',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate multi-chain balances' },
      { status: 500 }
    );
  }
}
