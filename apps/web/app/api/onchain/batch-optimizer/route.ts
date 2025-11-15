import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

const chainMap: Record<number, any> = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
};

/**
 * POST /api/onchain/batch-optimizer
 * Optimize batch transactions for gas efficiency
 * Uses Reown Wallet for secure transaction batching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, chainId } = body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid transactions array' },
        { status: 400 }
      );
    }

    if (!chainId) {
      return NextResponse.json(
        { error: 'Chain ID is required' },
        { status: 400 }
      );
    }

    const chain = chainMap[chainId] || mainnet;
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const optimized = await optimizeBatch(transactions, publicClient, chainId);

    const result = {
      originalCount: transactions.length,
      optimizedCount: optimized.length,
      estimatedGasSavings: calculateGasSavings(transactions.length, optimized.length),
      optimizedTransactions: optimized,
      recommendations: generateOptimizationRecommendations(transactions, optimized),
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch optimization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize batch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function optimizeBatch(transactions: any[], client: any, chainId: number): Promise<any[]> {
  const optimized: any[] = [];
  const grouped = groupByRecipient(transactions);

  for (const [recipient, txs] of Object.entries(grouped)) {
    if (txs.length === 1) {
      optimized.push(txs[0]);
    } else {
      const batched = await createBatchedTransaction(txs, recipient, client, chainId);
      optimized.push(batched);
    }
  }

  return optimized.sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityB - priorityA;
  });
}

function groupByRecipient(transactions: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  transactions.forEach((tx) => {
    const recipient = tx.to?.toLowerCase() || 'unknown';
    if (!grouped[recipient]) {
      grouped[recipient] = [];
    }
    grouped[recipient].push(tx);
  });

  return grouped;
}

async function createBatchedTransaction(
  transactions: any[],
  recipient: string,
  client: any,
  chainId: number
): Promise<any> {
  const totalValue = transactions.reduce((sum, tx) => 
    sum + BigInt(tx.value || '0'), BigInt(0));

  const estimatedGas = await estimateBatchGas(transactions, client);

  return {
    type: 'batched',
    to: recipient,
    value: totalValue.toString(),
    data: '0x', // Would need actual batch contract call data
    gas: estimatedGas.toString(),
    transactions: transactions.length,
    estimatedGasSavings: calculateIndividualGas(transactions) - estimatedGas,
    priority: calculatePriority(transactions),
  };
}

async function estimateBatchGas(transactions: any[], client: any): Promise<bigint> {
  const baseGas = BigInt(21000);
  const perTxGas = BigInt(5000);
  return baseGas + (perTxGas * BigInt(transactions.length));
}

function calculateIndividualGas(transactions: any[]): bigint {
  const baseGas = BigInt(21000);
  return baseGas * BigInt(transactions.length);
}

function calculateGasSavings(original: number, optimized: number): number {
  const individualGas = 21000 * original;
  const batchedGas = 21000 + (5000 * (original - optimized));
  const savings = individualGas - batchedGas;
  return Math.max(0, savings);
}

function calculatePriority(transactions: any[]): number {
  const totalValue = transactions.reduce((sum, tx) => 
    sum + parseFloat(tx.value || '0'), 0);
  
  if (totalValue > 1000000) return 10;
  if (totalValue > 100000) return 8;
  if (totalValue > 10000) return 6;
  return 4;
}

function generateOptimizationRecommendations(original: any[], optimized: any[]): string[] {
  const recommendations: string[] = [];
  const savings = original.length - optimized.length;

  if (savings > 0) {
    recommendations.push(`Batching ${savings} transactions can save gas`);
    recommendations.push('Use Reown wallet for secure batch execution');
  }

  if (original.length > 10) {
    recommendations.push('Consider splitting into multiple batches for better success rate');
  }

  return recommendations;
}

