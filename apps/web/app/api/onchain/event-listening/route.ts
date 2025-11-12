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
    const { 
      contractAddress, 
      abi, 
      eventName, 
      fromBlock, 
      toBlock, 
      chainId,
      args,
    } = body;

    if (!contractAddress || !abi || !eventName || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: contractAddress, abi, eventName, chainId' },
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

    const logs = await publicClient.getLogs({
      address: contractAddress as Address,
      event: {
        type: 'event',
        name: eventName,
        inputs: abi.find((item: any) => item.name === eventName)?.inputs || [],
      } as any,
      args: args,
      fromBlock: fromBlock ? BigInt(fromBlock) : 'earliest',
      toBlock: toBlock ? BigInt(toBlock) : 'latest',
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      eventName,
      chainId,
      events: logs.map((log) => ({
        blockNumber: log.blockNumber.toString(),
        transactionHash: log.transactionHash,
        args: log.args,
      })),
      totalEvents: logs.length,
      type: 'event_listening',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

