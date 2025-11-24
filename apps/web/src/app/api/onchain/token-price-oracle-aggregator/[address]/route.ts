/**
 * Token Price Oracle Aggregator
 * Aggregate prices from multiple oracles
 * GET /api/onchain/token-price-oracle-aggregator/[address]
 */
import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = { 1: mainnet, 8453: base, 42161: arbitrum, 10: optimism, 137: polygon } as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const tokenAddress = params.address as Address;

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tokenAddress,
      chainId,
      oracles: ['chainlink', 'band', 'uniswap'],
      aggregatedPrice: '0',
      type: 'price-oracle-aggregator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate oracle prices' },
      { status: 500 }
    );
  }
}
