import { NextRequest, NextResponse } from 'next/server';
import { Address, Abi } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, abi, functionName, args = [], chainId } = body;

    if (!contractAddress || !abi || !functionName || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, abi, functionName, chainId' },
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

    const result = await publicClient.readContract({
      address: contractAddress as Address,
      abi: abi as Abi,
      functionName,
      args: args.map((arg: any) => {
        // Convert string numbers to BigInt if needed
        if (typeof arg === 'string' && /^\d+$/.test(arg)) {
          return BigInt(arg);
        }
        return arg;
      }),
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      functionName,
      args,
      result: Array.isArray(result) 
        ? result.map((r: any) => r.toString())
        : result.toString(),
      chainId,
      type: 'contract_read',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to read contract' },
      { status: 500 }
    );
  }
}

