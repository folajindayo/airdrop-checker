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

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-token-age:${normalizedAddress}:${chainId || 'all'}`;
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

    const ageResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const bytecode = await publicClient.getBytecode({
            address: normalizedAddress,
          });

          if (bytecode && bytecode !== '0x') {
            const currentBlock = await publicClient.getBlockNumber();
            const currentBlockData = await publicClient.getBlock({ blockNumber: currentBlock });

            ageResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              tokenAddress: normalizedAddress,
              isContract: true,
              currentBlock: currentBlock.toString(),
              currentTimestamp: currentBlockData.timestamp,
              note: 'Token age requires deployment block lookup',
            });
          }
        } catch (error) {
          console.error(`Error calculating token age on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching age data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      ageResults,
      totalResults: ageResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 10 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token age calculator API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate on-chain token age',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

