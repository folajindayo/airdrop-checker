import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const toNumber = (v?: string | number | null): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const p = Number(v);
    return Number.isFinite(p) ? p : 0;
  }
  return 0;
};

/**
 * GET /api/onchain/token-gas-optimization-analyzer/[address]
 * Analyze gas usage patterns and suggest optimizations.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 300);

    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address' }, { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();
    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
    const cacheKey = `onchain-gas-opt:${normalizedAddress}:${targetChainId}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const response = await goldrushClient.get<{
      data?: { items?: any[] };
    }>(`/v1/${targetChainId}/address/${normalizedAddress}/transactions_v3/`, {
      'page-size': limit,
    });

    const items = response?.data?.items || [];
    const gasData = items.map((tx: any) => ({
      gasUsed: toNumber(tx.gas_spent),
      gasPrice: toNumber(tx.gas_price),
      gasQuote: toNumber(tx.gas_quote),
      valueQuote: toNumber(tx.value_quote),
    })).filter((tx) => tx.gasUsed > 0);

    if (!gasData.length) {
      const emptyPayload = {
        address: normalizedAddress,
        chainId: targetChainId,
        optimizationScore: 100,
        recommendations: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const avgGasUsed = gasData.reduce((sum, tx) => sum + tx.gasUsed, 0) / gasData.length;
    const avgGasQuote = gasData.reduce((sum, tx) => sum + tx.gasQuote, 0) / gasData.length;
    const totalValue = gasData.reduce((sum, tx) => sum + tx.valueQuote, 0);
    const gasToValueRatio = totalValue > 0 ? (avgGasQuote / totalValue) * 100 : 0;

    let optimizationScore = 100;
    const recommendations: Array<{ type: string; impact: string }> = [];

    if (avgGasUsed > 150000) {
      optimizationScore -= 20;
      recommendations.push({
        type: 'batch-transactions',
        impact: 'high',
      });
    }

    if (gasToValueRatio > 5) {
      optimizationScore -= 15;
      recommendations.push({
        type: 'optimize-gas-price',
        impact: 'medium',
      });
    }

    optimizationScore = Math.max(0, Math.min(100, optimizationScore));

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: gasData.length,
      avgGasUsed: +avgGasUsed.toFixed(0),
      avgGasQuote: +avgGasQuote.toFixed(4),
      gasToValueRatio: +gasToValueRatio.toFixed(2),
      optimizationScore: +optimizationScore.toFixed(2),
      recommendations,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Gas optimization analyzer error:', error);
    // Enhanced error logging for debugging
    return NextResponse.json(
      {
        error: 'Failed to analyze gas optimization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
