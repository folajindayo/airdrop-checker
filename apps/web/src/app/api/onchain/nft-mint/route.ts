import { NextRequest, NextResponse } from 'next/server';
import { Address, parseUnits } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Standard ERC721 mint function ABI
const erc721MintAbi = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, to, quantity = 1, chainId, mintPrice } = body;

    if (!contractAddress || !to || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, to, chainId' },
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

    const value = mintPrice ? parseUnits(mintPrice.toString(), 18) : BigInt(0);

    // Try quantity-based mint first (common for ERC721A)
    let transaction;
    try {
      transaction = {
        to: contractAddress as Address,
        value,
        data: publicClient.encodeFunctionData({
          abi: erc721MintAbi,
          functionName: 'mint',
          args: [to as Address, BigInt(quantity)],
        }),
      };
    } catch {
      // Fallback to single token mint
      transaction = {
        to: contractAddress as Address,
        value,
        data: publicClient.encodeFunctionData({
          abi: erc721MintAbi,
          functionName: 'mint',
          args: [to as Address, BigInt(1)],
        }),
      };
    }

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      contractAddress,
      to,
      quantity,
      mintPrice: mintPrice?.toString() || '0',
      type: 'nft_mint',
      message: `Mint ${quantity} NFT(s) to ${to}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare NFT mint transaction' },
      { status: 500 }
    );
  }
}

