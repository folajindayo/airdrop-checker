import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
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
 * POST /api/onchain/transaction-simulator
 * Simulate transactions before execution
 * Uses Viem for transaction simulation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      from,
      to,
      value,
      data,
      chainId,
      gasPrice,
    } = body;

    if (!isValidAddress(from)) {
      return NextResponse.json(
        { error: 'Invalid from address' },
        { status: 400 }
      );
    }

    if (to && !isValidAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid to address' },
        { status: 400 }
      );
    }

    const chainConfig = chains.find(c => c.id === parseInt(chainId || '1'));
    if (!chainConfig) {
      return NextResponse.json(
        { error: 'Invalid chain ID' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: chainConfig.chain,
      transport: http(),
    });

    // Estimate gas
    let gasEstimate = null;
    try {
      gasEstimate = await publicClient.estimateGas({
        account: from as `0x${string}`,
        to: to as `0x${string}` | undefined,
        value: value ? parseUnits(value, 18) : undefined,
        data: data as `0x${string}` | undefined,
      });
    } catch (error) {
      // Gas estimation failed - transaction would likely fail
    }

    // Get current gas price if not provided
    const currentGasPrice = gasPrice 
      ? parseUnits(gasPrice.toString(), 9) // Assuming gwei
      : await publicClient.getGasPrice();

    // Calculate estimated cost
    const estimatedCost = gasEstimate && currentGasPrice
      ? formatUnits(gasEstimate * currentGasPrice, 18)
      : null;

    // Check balance
    const balance = await publicClient.getBalance({
      address: from as `0x${string}`,
    });

    const hasEnoughBalance = value 
      ? balance >= parseUnits(value, 18) + (gasEstimate ? gasEstimate * currentGasPrice : 0n)
      : balance >= (gasEstimate ? gasEstimate * currentGasPrice : 0n);

    const result = {
      simulation: {
        from,
        to: to || null,
        value: value || '0',
        chainId: chainConfig.id,
        chainName: chainConfig.name,
        gasEstimate: gasEstimate ? gasEstimate.toString() : null,
        gasEstimateFormatted: gasEstimate ? formatUnits(gasEstimate, 0) : null,
        gasPrice: currentGasPrice.toString(),
        gasPriceFormatted: formatUnits(currentGasPrice, 9),
        estimatedCost: estimatedCost || null,
        estimatedCostUSD: null, // Would need price oracle
        balance: balance.toString(),
        balanceFormatted: formatUnits(balance, 18),
        hasEnoughBalance,
        wouldSucceed: gasEstimate !== null,
        wouldFail: gasEstimate === null,
      },
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('On-chain transaction simulator API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to simulate transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

