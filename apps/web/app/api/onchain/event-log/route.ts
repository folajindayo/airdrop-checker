import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { EventLogRequest, EventLog } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: EventLogRequest = await request.json();
    const { contractAddress, eventName, chainId, fromBlock, toBlock } = body;

    if (!contractAddress || !eventName) {
      return NextResponse.json(
        { error: 'Missing required parameters: contractAddress, eventName' },
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

    const currentBlock = await publicClient.getBlockNumber();
    const from = fromBlock || Number(currentBlock) - 1000;
    const to = toBlock || Number(currentBlock);

    const logs = await publicClient.getLogs({
      address: contractAddress,
      fromBlock: BigInt(from),
      toBlock: BigInt(to),
    });

    const events = logs.map((log, index) => ({
      blockNumber: Number(log.blockNumber),
      transactionHash: log.transactionHash,
      args: log.args,
      timestamp: Date.now() - (logs.length - index) * 12000,
    }));

    const frequency = events.length / ((to - from) / 100);
    const patterns: string[] = [];

    const eventLog: EventLog = {
      contractAddress,
      eventName,
      totalEvents: events.length,
      events,
      frequency,
      patterns,
    };

    return NextResponse.json({
      success: true,
      ...eventLog,
      type: 'event-log',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze event logs' },
      { status: 500 }
    );
  }
}

