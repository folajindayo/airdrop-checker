import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const blockNumber = searchParams.get('blockNumber');
    const chainId = searchParams.get('chainId');

    const cacheKey = `onchain-block-tx-count:${blockNumber || 'latest'}:${chainId || 'all'}`;
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

    const blockResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const targetBlock = blockNumber
            ? BigInt(blockNumber)
            : await publicClient.getBlockNumber();

          const block = await publicClient.getBlock({ blockNumber: targetBlock });

          blockResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            blockNumber: targetBlock.toString(),
            transactionCount: block.transactions.length,
            timestamp: block.timestamp,
            date: new Date(Number(block.timestamp) * 1000).toISOString(),
          });
        } catch (error) {
          console.error(`Error fetching block on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching block data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      blockResults,
      totalResults: blockResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 1 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain block transaction count API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to count on-chain block transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

