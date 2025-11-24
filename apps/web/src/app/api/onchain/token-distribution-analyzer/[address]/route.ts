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
 * GET /api/onchain/token-distribution-analyzer/[address]
 * Analyze on-chain token distribution patterns for a token contract
 * Provides distribution metrics and concentration analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const holderAddresses = searchParams.get('holders')?.split(',');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-distribution:${normalizedAddress}:${chainId || 'all'}:${holderAddresses?.join(',') || 'all'}`;
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

          // Analyze specific holders if provided
          const holderBalances: any[] = [];
          if (holderAddresses && holderAddresses.length > 0) {
            for (const holder of holderAddresses) {
              if (isValidAddress(holder)) {
                try {
                  const balance = await publicClient.readContract({
                    address: normalizedAddress,
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [holder.toLowerCase() as `0x${string}`],
                  });

                  const percentage = totalSupply > 0n
                    ? Number((balance * 10000n) / totalSupply) / 100
                    : 0;

                  holderBalances.push({
                    address: holder.toLowerCase(),
                    balance: balance.toString(),
                    formattedBalance: formatUnits(balance, decimals),
                    percentage,
                  });
                } catch (error) {
                  console.error(`Error fetching balance for ${holder}:`, error);
                }
              }
            }
          }

          // Calculate distribution metrics
          const topHolders = holderBalances
            .sort((a, b) => Number(b.balance) - Number(a.balance))
            .slice(0, 10);

          const totalAnalyzed = holderBalances.reduce(
            (sum, h) => sum + BigInt(h.balance),
            0n
          );

          const concentration = topHolders.reduce(
            (sum, h) => sum + h.percentage,
            0
          );

          distributionResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            totalSupply: totalSupply.toString(),
            formattedTotalSupply: formatUnits(totalSupply, decimals),
            decimals,
            distribution: {
              totalHoldersAnalyzed: holderBalances.length,
              totalAnalyzed: totalAnalyzed.toString(),
              formattedTotalAnalyzed: formatUnits(totalAnalyzed, decimals),
              topHolders,
              concentration: {
                top10Percentage: concentration,
                isConcentrated: concentration > 50,
                riskLevel: concentration > 80 ? 'high' : concentration > 50 ? 'medium' : 'low',
              },
            },
          });
        } catch (error) {
          console.error(`Error analyzing distribution on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching distribution data on ${chainConfig.name}:`, error);
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
    console.error('On-chain token distribution analyzer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain token distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

