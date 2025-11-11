import { NextRequest, NextResponse } from 'next/server';
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

/**
 * GET /api/onchain/gas-price-oracle
 * Get real-time gas prices from on-chain oracles
 * Uses direct blockchain calls via Viem
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    const cacheKey = `onchain-gas-price-oracle:${chainId || 'all'}`;
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

    const gasPrices: any[] = [];

    for (const chainConfig of targetChains) {
      try {
        const publicClient = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        // Get current gas price from the chain
        const gasPrice = await publicClient.getGasPrice();
        
        // Get fee data (EIP-1559 chains)
        let feeData = null;
        try {
          feeData = await publicClient.estimateFeesPerGas();
        } catch {
          // Not all chains support EIP-1559
        }

        // Get latest block for context
        const block = await publicClient.getBlock({ blockTag: 'latest' });

        const gasPriceData = {
          chainId: chainConfig.id,
          chainName: chainConfig.name,
          gasPrice: {
            wei: gasPrice.toString(),
            gwei: Number(gasPrice) / 1e9,
            formatted: `${(Number(gasPrice) / 1e9).toFixed(2)} Gwei`,
          },
          feeData: feeData ? {
            maxFeePerGas: feeData.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
            baseFeePerGas: feeData.maxFeePerGas 
              ? (Number(feeData.maxFeePerGas) - Number(feeData.maxPriorityFeePerGas || 0)).toString()
              : null,
          } : null,
          blockNumber: Number(block.number),
          blockTimestamp: Number(block.timestamp),
          estimatedTransactionCost: {
            standard: (Number(gasPrice) * 21000 / 1e18).toFixed(6), // Simple transfer
            contract: (Number(gasPrice) * 100000 / 1e18).toFixed(6), // Contract interaction
            complex: (Number(gasPrice) * 500000 / 1e18).toFixed(6), // Complex contract
          },
        };

        gasPrices.push(gasPriceData);
      } catch (error) {
        console.error(`Error fetching gas price on ${chainConfig.name}:`, error);
        gasPrices.push({
          chainId: chainConfig.id,
          chainName: chainConfig.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const result = {
      gasPrices,
      timestamp: Date.now(),
      summary: {
        cheapestChain: gasPrices
          .filter(g => g.gasPrice)
          .sort((a, b) => a.gasPrice.gwei - b.gasPrice.gwei)[0],
        mostExpensiveChain: gasPrices
          .filter(g => g.gasPrice)
          .sort((a, b) => b.gasPrice.gwei - a.gasPrice.gwei)[0],
        averageGasPrice: gasPrices
          .filter(g => g.gasPrice)
          .reduce((sum, g) => sum + g.gasPrice.gwei, 0) / gasPrices.filter(g => g.gasPrice).length,
      },
    };

    // Cache for 30 seconds (gas prices change frequently)
    cache.set(cacheKey, result, 30 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain gas price oracle API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch gas prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

