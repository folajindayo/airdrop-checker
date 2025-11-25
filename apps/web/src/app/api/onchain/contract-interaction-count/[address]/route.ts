import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { isValidAddress } from '@airdrop-finder/shared';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

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
    const contractAddress = searchParams.get('contract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-interaction-count:${normalizedAddress}:${contractAddress || 'all'}:${chainId || 'all'}`;
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

    const interactionResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const latestBlock = await publicClient.getBlockNumber();
          const fromBlock = latestBlock - BigInt(10000);

          const targetContract = contractAddress || normalizedAddress;
          const logs = await publicClient.getLogs({
            address: targetContract as `0x${string}`,
            fromBlock: fromBlock,
            toBlock: 'latest',
          });

          interactionResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            walletAddress: normalizedAddress,
            contractAddress: targetContract.toLowerCase(),
            interactionCount: logs.length,
            blockRange: Number(latestBlock - fromBlock),
          });
        } catch (error) {
          console.error(`Error counting interactions on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching interaction data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      interactionResults,
      totalResults: interactionResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain interaction count API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to count on-chain contract interactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

