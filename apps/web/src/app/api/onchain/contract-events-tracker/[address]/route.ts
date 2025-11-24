import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const fromBlock = searchParams.get('fromBlock');
    const eventName = searchParams.get('event');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-events-tracker:${normalizedAddress}:${eventName || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChains = chainId
      ? chains.filter((c) => c.id === parseInt(chainId))
      : chains;

    const eventResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const latestBlock = await publicClient.getBlockNumber();
          const fromBlockNumber = fromBlock
            ? BigInt(fromBlock)
            : latestBlock - BigInt(1000);

          const logs = await publicClient.getLogs({
            address: normalizedAddress,
            fromBlock: fromBlockNumber,
            toBlock: 'latest',
          });

          eventResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            contractAddress: normalizedAddress,
            eventName: eventName || 'All Events',
            totalEvents: logs.length,
            fromBlock: fromBlockNumber.toString(),
            toBlock: latestBlock.toString(),
            blockRange: Number(latestBlock - fromBlockNumber),
          });
        } catch (error) {
          console.error(`Error tracking events on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching event data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      eventResults,
      totalResults: eventResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain events tracker API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track on-chain contract events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

