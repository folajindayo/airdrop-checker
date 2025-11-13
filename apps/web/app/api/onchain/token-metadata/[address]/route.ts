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
 * GET /api/onchain/token-metadata/[address]
 * Fetch token metadata directly from blockchain
 * Uses direct contract calls via Viem
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
    const cacheKey = `onchain-token-metadata:${normalizedAddress}:${chainId || 'all'}`;
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

    const metadata: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // Fetch ERC20 metadata
        try {
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

          if (name || symbol) {
            metadata.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              contractAddress: normalizedAddress,
              name: name || 'Unknown',
              symbol: symbol || 'UNKNOWN',
              decimals: decimals ? Number(decimals) : 18,
              totalSupply: totalSupply ? totalSupply.toString() : null,
              totalSupplyFormatted: totalSupply && decimals
                ? formatUnits(totalSupply, Number(decimals))
                : null,
              standard: 'ERC20',
            });
          }
        } catch {
          // Not an ERC20 token or contract doesn't exist
        }
      } catch (error) {
        console.error(`Error fetching token metadata on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      tokenAddress: normalizedAddress,
      metadata,
      found: metadata.length > 0,
      timestamp: Date.now(),
    };

    // Cache for 1 hour (metadata doesn't change)
    cache.set(cacheKey, result, 60 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain token metadata API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch token metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

