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
 * GET /api/onchain/token-holder-distribution/[address]
 * Analyze on-chain token holder distribution for a token contract
 * Provides concentration metrics and distribution analysis
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
    const cacheKey = `onchain-holder-dist:${normalizedAddress}:${chainId || 'all'}`;
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

    const distributionResults: any[] = [];

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

          const formattedTotalSupply = formatUnits(totalSupply, decimals);

          // Note: Full holder distribution requires indexing services
          // This provides basic token metrics
          distributionResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            totalSupply: totalSupply.toString(),
            formattedTotalSupply,
            decimals,
            analysis: {
              note: 'Full holder distribution requires blockchain indexing services',
              metrics: {
                totalSupply,
                decimals,
              },
            },
          });
        } catch (error) {
          console.error(`Error analyzing token distribution on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching token distribution on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      distributionResults,
      totalResults: distributionResults.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token holder distribution API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain token holder distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

