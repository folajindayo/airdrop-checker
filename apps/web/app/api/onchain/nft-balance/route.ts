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

// ERC721 balanceOf ABI
const erc721Abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const contractAddress = searchParams.get('contractAddress');
    const chainId = parseInt(searchParams.get('chainId') || '1');

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

    if (contractAddress) {
      // Specific NFT contract balance
      const balance = await publicClient.readContract({
        address: contractAddress as Address,
        abi: erc721Abi,
        functionName: 'balanceOf',
        args: [address as Address],
      });

      return NextResponse.json({
        success: true,
        address,
        contractAddress,
        chainId,
        balance: balance.toString(),
        type: 'nft_balance',
      });
    } else {
      // Note: Getting all NFTs requires indexing service
      return NextResponse.json({
        success: true,
        address,
        chainId,
        message: 'Please specify contractAddress to check NFT balance for a specific collection',
        type: 'nft_balance',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NFT balance' },
      { status: 500 }
    );
  }
}

