import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, formatUnits } from 'viem';
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
    const txHash = searchParams.get('txHash');
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase() as `0x${string}`;
    const cacheKey = `onchain-gas-usage:${normalizedAddress}:${txHash || 'all'}:${chainId || 'all'}`;
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

    const gasResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        if (txHash) {
          try {
            const receipt = await publicClient.getTransactionReceipt({
              hash: txHash as `0x${string}`,
            });

            const tx = await publicClient.getTransaction({
              hash: txHash as `0x${string}`,
            });

            const gasUsed = receipt.gasUsed;
            const gasPrice = tx.gasPrice || 0n;
            const totalCost = gasUsed * gasPrice;

            gasResults.push({
              chainId: chainConfig.id,
              chainName: chainConfig.name,
              txHash,
              from: tx.from,
              to: tx.to,
              gasUsed: gasUsed.toString(),
              gasPrice: gasPrice.toString(),
              formattedGasPrice: formatUnits(gasPrice, 9),
              totalCost: totalCost.toString(),
              formattedTotalCost: formatUnits(totalCost, 18),
              status: receipt.status,
            });
          } catch (error) {
            console.error(`Error analyzing gas usage on ${chainConfig.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error fetching gas data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      address: normalizedAddress,
      gasResults,
      totalResults: gasResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain gas usage analyzer API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze on-chain gas usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

