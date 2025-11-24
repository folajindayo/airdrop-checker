import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { erc20Abi } from 'viem';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const chains = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: base.id, name: 'Base', chain: base },
  { id: arbitrum.id, name: 'Arbitrum', chain: arbitrum },
  { id: optimism.id, name: 'Optimism', chain: optimism },
  { id: polygon.id, name: 'Polygon', chain: polygon },
];

/**
 * GET /api/onchain/token-minting-tracker/[address]
 * Track on-chain token minting events for a token contract
 * Monitors token supply increases through minting mechanisms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const fromBlock = searchParams.get('fromBlock');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-minting-tracker:${normalizedAddress}:${chainId || 'all'}:${fromBlock || 'latest'}`;
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

    const mintingResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          // Get current total supply
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

          // Get latest block
          const latestBlock = await publicClient.getBlockNumber();
          const fromBlockNumber = fromBlock
            ? BigInt(fromBlock)
            : latestBlock - BigInt(10000); // Last 10k blocks

          // Query mint events (Transfer from zero address)
          const mintEvents = await publicClient.getLogs({
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
            args: {
              from: ZERO_ADDRESS as `0x${string}`,
            },
            fromBlock: fromBlockNumber,
            toBlock: 'latest',
          });

          const totalMinted = mintEvents.reduce(
            (sum, event) => sum + (event.args.value || 0n),
            0n
          );

          mintingResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            totalSupply: totalSupply.toString(),
            formattedTotalSupply: formatUnits(totalSupply, decimals),
            totalMinted: totalMinted.toString(),
            formattedTotalMinted: formatUnits(totalMinted, decimals),
            mintEvents: mintEvents.length,
            mintPercentage:
              totalSupply > 0n
                ? Number((totalMinted * 10000n) / totalSupply) / 100
                : 0,
            decimals,
            analysis: {
              mintedTokens: totalMinted.toString(),
              currentSupply: totalSupply.toString(),
              mintRate: mintEvents.length > 0 ? totalMinted / BigInt(mintEvents.length) : 0n,
              isMintable: mintEvents.length > 0,
            },
          });
        } catch (error) {
          console.error(`Error tracking mints on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching minting data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      mintingResults,
      totalResults: mintingResults.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token minting tracker API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track on-chain token minting',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

