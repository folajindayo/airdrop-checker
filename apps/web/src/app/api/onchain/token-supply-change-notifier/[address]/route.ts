/**
 * Token Supply Change Notifier
 * Monitor and notify on token supply changes
 * GET /api/onchain/token-supply-change-notifier/[address]
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
    const fromBlock = searchParams.get('fromBlock');
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const tokenAddress = params.address as Address;

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

    const currentSupply = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'totalSupply',
    });

    const previousSupply = fromBlock
      ? await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'totalSupply',
          blockNumber: BigInt(fromBlock),
        })
      : currentSupply;

    const supplyChange = currentSupply - previousSupply;

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      currentSupply: currentSupply.toString(),
      previousSupply: previousSupply.toString(),
      supplyChange: supplyChange.toString(),
      changeType: supplyChange > 0n ? 'increase' : supplyChange < 0n ? 'decrease' : 'no-change',
      type: 'supply-change-notifier',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to monitor supply changes' },
      { status: 500 }
    );
  }
}
