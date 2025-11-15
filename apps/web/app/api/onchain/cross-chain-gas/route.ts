import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

// Gas comparison threshold in gwei
const GAS_ALERT_THRESHOLD = 50;

const supportedChains = [
  { id: 1, chain: mainnet, name: 'Ethereum' },
  { id: 8453, chain: base, name: 'Base' },
  { id: 42161, chain: arbitrum, name: 'Arbitrum' },
  { id: 10, chain: optimism, name: 'Optimism' },
  { id: 137, chain: polygon, name: 'Polygon' },
];

export async function GET(request: NextRequest) {
  try {
    const gasData = [];

    for (const chainInfo of supportedChains) {
      const client = createPublicClient({
        chain: chainInfo.chain,
        transport: http(),
      });

      try {
        const gasPrice = await client.getGasPrice();
        const gasPriceGwei = Number(gasPrice) / 1e9;

        gasData.push({
          chainId: chainInfo.id,
          chainName: chainInfo.name,
          gasPrice: gasPrice.toString(),
          gasPriceGwei: gasPriceGwei.toFixed(4),
        });
      } catch (error) {
        console.error(`Error fetching gas for ${chainInfo.name}:`, error);
      }
    }

    const sortedByGas = [...gasData].sort((a, b) => 
      parseFloat(a.gasPriceGwei) - parseFloat(b.gasPriceGwei)
    );

    return NextResponse.json({
      success: true,
      chains: gasData,
      cheapest: sortedByGas[0],
      mostExpensive: sortedByGas[sortedByGas.length - 1],
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gas prices' },
      { status: 500 }
    );
  }
}


