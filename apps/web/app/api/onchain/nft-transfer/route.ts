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

// ERC721 transferFrom ABI
const erc721TransferAbi = [
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, from, to, tokenId, chainId, safeTransfer = true } = body;

    if (!contractAddress || !from || !to || tokenId === undefined || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, from, to, tokenId, chainId' },
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

    const transaction = {
      to: contractAddress as Address,
      data: publicClient.encodeFunctionData({
        abi: erc721TransferAbi,
        functionName: safeTransfer ? 'safeTransferFrom' : 'transferFrom',
        args: [from as Address, to as Address, BigInt(tokenId)],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      contractAddress,
      from,
      to,
      tokenId: tokenId.toString(),
      safeTransfer,
      type: 'nft_transfer',
      message: `Transfer NFT #${tokenId} from ${from} to ${to}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare NFT transfer transaction' },
      { status: 500 }
    );
  }
}

