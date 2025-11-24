import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const txHash = searchParams.get('txHash');
    const chainId = searchParams.get('chainId');

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    const cacheKey = `onchain-fee-calculator:${txHash}:${chainId || 'all'}`;
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

    const feeResults: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        try {
          const receipt = await publicClient.getTransactionReceipt({
            hash: txHash as `0x${string}`,
          });

          const tx = await publicClient.getTransaction({
            hash: txHash as `0x${string}`,
          });

          const gasUsed = receipt.gasUsed;
          const gasPrice = tx.gasPrice || 0n;
          const totalFee = gasUsed * gasPrice;

          feeResults.push({
            chainId: chainConfig.id,
            chainName: chainConfig.name,
            txHash,
            gasUsed: gasUsed.toString(),
            gasPrice: gasPrice.toString(),
            formattedGasPrice: formatUnits(gasPrice, 9),
            totalFee: totalFee.toString(),
            formattedTotalFee: formatUnits(totalFee, 18),
            status: receipt.status,
          });
        } catch (error) {
          console.error(`Error calculating fees on ${chainConfig.name}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching fee data on ${chainConfig.name}:`, error);
      }
    }

    const result = {
      txHash,
      feeResults,
      totalResults: feeResults.length,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 2 * 60 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain fee calculator API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate on-chain transaction fees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

