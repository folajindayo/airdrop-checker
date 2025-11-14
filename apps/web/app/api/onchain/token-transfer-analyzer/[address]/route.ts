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
    const tokenAddress = searchParams.get('token');
    const chainId = searchParams.get('chainId');
    const fromBlock = searchParams.get('fromBlock');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-transfer-analyzer:${normalizedAddress}:${tokenAddress || 'all'}:${chainId || 'all'}`;
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

    const transferResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (tokenAddress && isValidAddress(tokenAddress)) {
          try {
            const latestBlock = await publicClient.getBlockNumber();
            const fromBlockNumber = fromBlock
              ? BigInt(fromBlock)
              : latestBlock - BigInt(10000);

            const transferEvents = await publicClient.getLogs({
              address: tokenAddress as `0x${string}`,
              event: {
                type: 'event',
                name: 'Transfer',
                inputs: [
                  { type: 'address', indexed: true, name: 'from' },
                  { type: 'address', indexed: true, name: 'to' },
                  { type: 'uint256', indexed: false, name: 'value' },
                ],
              },
              args: {
                from: normalizedAddress,
              },
              fromBlock: fromBlockNumber,
              toBlock: 'latest',
            });

            transferResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              tokenAddress: tokenAddress.toLowerCase(),
              address: normalizedAddress,
              transferEvents: transferEvents.length,
              fromBlock: fromBlockNumber.toString(),
              toBlock: latestBlock.toString(),
            });
          } catch (error) {
            console.error(`Error analyzing transfers on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching transfer data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      transferResults,
      totalResults: transferResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain transfer analyzer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain token transfers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

