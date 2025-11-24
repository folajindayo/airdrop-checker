import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
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

/**
 * GET /api/onchain/token-supply-tracker/[address]
 * Track on-chain token supply metrics over time
 * Monitors circulating supply, total supply, and supply changes
 */
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
    const cacheKey = `onchain-supply-tracker:${normalizedAddress}:${chainId || 'all'}`;
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

    const supplyResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          // Get total supply
          const totalSupply = await publicClient.readContract({
            address: normalizedAddress,
            abi: erc20Abi,
            functionName: 'totalSupply',
          });

          // Get decimals
          let decimals = 18;
          try {
            const decimalsResult = await publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'decimals',
            });
            decimals = Number(decimalsResult);
          } catch {
            // Default to 18
          }

          // Get current block for timestamp
          const currentBlock = await publicClient.getBlockNumber();
          const block = await publicClient.getBlock({ blockNumber: currentBlock });

          // Check if contract has burn address balance (circulating supply calculation)
          const zeroAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;
          let burnedSupply = 0n;
          try {
            burnedSupply = await publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [zeroAddress],
            });
          } catch {
            // Burn address might not hold tokens
          }

          const circulatingSupply = totalSupply - burnedSupply;
          const burnPercentage = totalSupply > 0n
            ? Number((burnedSupply * 10000n) / totalSupply) / 100
            : 0;

          supplyResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            supply: {
              totalSupply: totalSupply.toString(),
              formattedTotalSupply: formatUnits(totalSupply, decimals),
              burnedSupply: burnedSupply.toString(),
              formattedBurnedSupply: formatUnits(burnedSupply, decimals),
              circulatingSupply: circulatingSupply.toString(),
              formattedCirculatingSupply: formatUnits(circulatingSupply, decimals),
              burnPercentage,
            },
            decimals,
            blockNumber: currentBlock.toString(),
            timestamp: block.timestamp,
            date: new Date(Number(block.timestamp) * 1000).toISOString(),
            analysis: {
              isDeflationary: burnedSupply > 0n,
              circulationRatio: totalSupply > 0n
                ? Number((circulatingSupply * 10000n) / totalSupply) / 100
                : 100,
              supplyType: burnedSupply > 0n ? 'Deflationary' : 'Fixed/Max Supply',
            },
          });
        } catch (error) {
          console.error(`Error tracking supply on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching supply data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      supplyResults,
      totalResults: supplyResults.length,
      timestamp: Date.now(),
    };

    // Cache for 2 minutes
    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token supply tracker API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track on-chain token supply',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

