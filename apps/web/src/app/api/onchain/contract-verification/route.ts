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
    const contractAddress = searchParams.get('contractAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
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

    // Check if contract has code
    const code = await publicClient.getBytecode({
      address: contractAddress as Address,
    });

    const isContract = code && code !== '0x';

    // Try to read basic contract info
    let contractInfo = null;
    if (isContract) {
      try {
        const [name, symbol] = await Promise.all([
          publicClient.readContract({
            address: contractAddress as Address,
            abi: [{ inputs: [], name: 'name', outputs: [{ type: 'string' }], stateMutability: 'view', type: 'function' }],
            functionName: 'name',
          }).catch(() => null),
          publicClient.readContract({
            address: contractAddress as Address,
            abi: [{ inputs: [], name: 'symbol', outputs: [{ type: 'string' }], stateMutability: 'view', type: 'function' }],
            functionName: 'symbol',
          }).catch(() => null),
        ]);

        contractInfo = { name, symbol };
      } catch {
        // Contract might not have standard functions
      }
    }

    return NextResponse.json({
      success: true,
      contractAddress,
      chainId,
      isContract,
      hasCode: isContract,
      contractInfo,
      explorerUrl: `${chain.blockExplorers?.default?.url}/address/${contractAddress}`,
      type: 'contract_verification',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify contract' },
      { status: 500 }
    );
  }
}

