import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';
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

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-holder-count:${normalizedAddress}:${chainId || 'all'}`;
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

    const holderResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const totalSupply = await publicClient.readContract({
            address: normalizedAddress,
            abi: erc20Abi,
            functionName: 'totalSupply',
          });

          const latestBlock = await publicClient.getBlockNumber();
          const fromBlock = latestBlock - BigInt(10000);

          const transferEvents = await publicClient.getLogs({
            address: normalizedAddress,
            event: {
              type: 'event',
              name: 'Transfer',
              inputs: [
                { type: 'address', indexed: true, name: 'from' },
                { type: 'address', indexed: true, name: 'to' },
                { type: 'uint256', indexed: false, name: 'value' },
              ],
            },
            fromBlock: fromBlock,
            toBlock: 'latest',
          });

          const uniqueHolders = new Set<string>();
          transferEvents.forEach((event) => {
            if (event.args.to) uniqueHolders.add(event.args.to.toLowerCase());
          });

          holderResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            totalSupply: totalSupply.toString(),
            estimatedHolders: uniqueHolders.size,
            transferEvents: transferEvents.length,
            note: 'Holder count is estimated from recent transfer events',
          });
        } catch (error) {
          console.error(`Error counting holders on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching holder data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      holderResults,
      totalResults: holderResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain holder count API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to count on-chain token holders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

