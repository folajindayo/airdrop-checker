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

/**
 * GET /api/onchain/token-metadata-updater/[address]
 * Get on-chain token metadata and check for update capabilities
 * Provides current token metadata and update status
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
    const cacheKey = `onchain-metadata-updater:${normalizedAddress}:${chainId || 'all'}`;
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

    const metadataResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          // Get token metadata
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'name',
            }).catch(() => null),
            publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'symbol',
            }).catch(() => null),
            publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'decimals',
            }).catch(() => null),
            publicClient.readContract({
              address: normalizedAddress,
              abi: erc20Abi,
              functionName: 'totalSupply',
            }).catch(() => null),
          ]);

          // Check bytecode for metadata update functions
          const bytecode = await publicClient.getBytecode({
            address: normalizedAddress,
          });

          const hasUpdateFunctions = bytecode
            ? bytecode.includes('4e1273f4') || // updateURI pattern
              bytecode.includes('06fdde03') || // setName pattern
              bytecode.includes('95d89b41') || // setSymbol pattern
              bytecode.includes('8da5cb5b') // Ownable pattern (indicates update capability)
            : false;

          metadataResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            tokenAddress: normalizedAddress,
            metadata: {
              name: name || 'Unknown',
              symbol: symbol || 'Unknown',
              decimals: decimals ? Number(decimals) : 18,
              totalSupply: totalSupply ? totalSupply.toString() : '0',
            },
            updateCapabilities: {
              canUpdateMetadata: hasUpdateFunctions,
              hasOwnable: bytecode ? bytecode.includes('8da5cb5b') : false,
              isUpgradeable: hasUpdateFunctions,
            },
            analysis: {
              isStandardERC20: name !== null && symbol !== null && decimals !== null,
              metadataComplete: name && symbol && decimals,
              updateRisk: hasUpdateFunctions ? 'medium' : 'low',
            },
          });
        } catch (error) {
          console.error(`Error reading metadata on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching metadata on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      metadataResults,
      totalResults: metadataResults.length,
      timestamp: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token metadata updater API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain token metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

