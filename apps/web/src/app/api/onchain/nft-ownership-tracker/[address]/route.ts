import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

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
    const nftContract = searchParams.get('contract');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-nft-ownership:${normalizedAddress}:${nftContract || 'all'}:${chainId || 'all'}`;
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

    const ownershipResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (nftContract && isValidAddress(nftContract)) {
          try {
            const balance = await publicClient.readContract({
              address: nftContract as `0x${string}`,
              abi: ERC721_ABI,
              functionName: 'balanceOf',
              args: [normalizedAddress],
            });

            ownershipResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              nftContract: nftContract.toLowerCase(),
              owner: normalizedAddress,
              balance: balance.toString(),
              tokenCount: Number(balance),
            });
          } catch (error) {
            console.error(`Error reading NFT ownership on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching NFT ownership on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      ownershipResults,
      totalResults: ownershipResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 5 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain NFT ownership tracker API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track on-chain NFT ownership',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

