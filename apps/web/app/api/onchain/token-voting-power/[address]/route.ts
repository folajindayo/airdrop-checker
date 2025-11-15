/**
 * Token Voting Power Calculator
 * Calculate voting power based on token balance and delegation
 * GET /api/onchain/token-voting-power/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address, formatUnits, createPublicClient, http } from 'viem';
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
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const voterAddress = params.address as Address;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
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

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [voterAddress],
    });

    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    });

    const votingPower = balance;
    const votingPowerFormatted = formatUnits(votingPower, decimals);

    return NextResponse.json({
      success: true,
      voterAddress,
      tokenAddress,
      chainId,
      votingPower: votingPower.toString(),
      votingPowerFormatted,
      decimals: Number(decimals),
      type: 'token-voting-power',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate voting power' },
      { status: 500 }
    );
  }
}

