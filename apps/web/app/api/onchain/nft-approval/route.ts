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

// ERC721 approval ABI
const erc721ApprovalAbi = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, operator, tokenId, chainId, approveAll = false } = body;

    if (!contractAddress || !operator || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, operator, chainId' },
        { status: 400 }
      );
    }

    if (!approveAll && tokenId === undefined) {
      return NextResponse.json(
        { error: 'tokenId required when approveAll is false' },
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

    const transaction = approveAll
      ? {
          to: contractAddress as Address,
          data: publicClient.encodeFunctionData({
            abi: erc721ApprovalAbi,
            functionName: 'setApprovalForAll',
            args: [operator as Address, true],
          }),
        }
      : {
          to: contractAddress as Address,
          data: publicClient.encodeFunctionData({
            abi: erc721ApprovalAbi,
            functionName: 'approve',
            args: [operator as Address, BigInt(tokenId!)],
          }),
        };

    return NextResponse.json({
      success: true,
      transaction,
      chainId,
      contractAddress,
      operator,
      tokenId: approveAll ? 'all' : tokenId?.toString(),
      approveAll,
      type: 'nft_approval',
      message: approveAll 
        ? `Approve all NFTs for ${operator}`
        : `Approve NFT #${tokenId} for ${operator}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare NFT approval transaction' },
      { status: 500 }
    );
  }
}

