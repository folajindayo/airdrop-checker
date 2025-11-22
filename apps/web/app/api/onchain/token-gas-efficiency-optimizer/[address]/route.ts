import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * GET /api/onchain/token-gas-efficiency-optimizer/[address]
 * Analyze gas efficiency and suggest optimizations.
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
    const cacheKey = `onchain-gas-efficiency:${normalizedAddress}:${chainId || '1'}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId, 10) : 1;
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
      txHash: tx.tx_hash,
    })).filter((tx) => tx.gasUsed > 0);

    if (!gasData.length) {
      const emptyPayload = {
        address: normalizedAddress,
        chainId: targetChainId,
        efficiencyScore: 0,
        recommendations: [],
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const avgGasUsed = gasData.reduce((sum, tx) => sum + tx.gasUsed, 0) / gasData.length;
    const avgGasPrice = gasData.reduce((sum, tx) => sum + tx.gasPrice, 0) / gasData.length;
    const avgGasQuote = gasData.reduce((sum, tx) => sum + tx.gasQuote, 0) / gasData.length;
    const totalValue = gasData.reduce((sum, tx) => sum + tx.valueQuote, 0);
    const gasToValueRatio = totalValue > 0 ? (avgGasQuote / totalValue) * 100 : 0;

    let efficiencyScore = 100;
    const recommendations: Array<{ issue: string; impact: number }> = [];

    if (avgGasUsed > 150000) {
      const impact = Math.min(30, (avgGasUsed - 150000) / 10000);
      efficiencyScore -= impact;
      recommendations.push({ issue: 'high-gas-usage', impact: +impact.toFixed(2) });
    }

    if (gasToValueRatio > 5) {
      const impact = Math.min(25, (gasToValueRatio - 5) * 2);
      efficiencyScore -= impact;
      recommendations.push({ issue: 'high-gas-to-value-ratio', impact: +impact.toFixed(2) });
    }

    if (avgGasPrice > 50) {
      const impact = Math.min(20, (avgGasPrice - 50) / 5);
      efficiencyScore -= impact;
      recommendations.push({ issue: 'high-gas-price', impact: +impact.toFixed(2) });
    }

    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransactions: gasData.length,
      avgGasUsed: +avgGasUsed.toFixed(0),
      avgGasPrice: +avgGasPrice.toFixed(2),
      avgGasQuote: +avgGasQuote.toFixed(4),
      gasToValueRatio: +gasToValueRatio.toFixed(2),
      efficiencyScore: +efficiencyScore.toFixed(2),
      recommendations: recommendations.sort((a, b) => b.impact - a.impact),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Gas efficiency optimizer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze gas efficiency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
