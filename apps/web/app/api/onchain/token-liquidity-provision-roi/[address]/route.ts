import { NextRequest, NextResponse } from 'next/server';
import { cache, isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';

export const dynamic = 'force-dynamic';

const LP_HINTS = ['uniswap', 'curve', 'balancer', 'sushiswap', 'pancake', 'addliquidity', 'removeliquidity'];

const normalize = (value?: string | null) => (value || '').toLowerCase();
const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const looksLikeLP = (tx: any) => {
  const blob = `${normalize(tx.to_address_label)} ${normalize(tx.from_address_label)}`;
  return LP_HINTS.some((hint) => blob.includes(hint));
};

/**
 * GET /api/onchain/token-liquidity-provision-roi/[address]
 * Calculate ROI for liquidity provision activities.
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
    const cacheKey = `onchain-lp-roi:${normalizedAddress}:${chainId || '1'}:${limit}`;
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

    const items = (response?.data?.items || []).filter(looksLikeLP);
    const lpEvents = items.map((tx: any) => ({
      txHash: tx.tx_hash,
      valueUsd: toNumber(tx.value_quote),
      gasUsd: toNumber(tx.gas_quote),
      occurredAt: tx.block_signed_at,
      successful: tx.successful !== false,
    }));

    if (!lpEvents.length) {
      const emptyPayload = {
        address: normalizedAddress,
        chainId: targetChainId,
        totalLPTransactions: 0,
        totalInvestedUsd: 0,
        totalGasSpentUsd: 0,
        estimatedROI: 0,
        timestamp: Date.now(),
      } as const;
      cache.set(cacheKey, emptyPayload, 60 * 1000);
      return NextResponse.json(emptyPayload);
    }

    const totalInvested = lpEvents.reduce((sum, event) => sum + event.valueUsd, 0);
    const totalGas = lpEvents.reduce((sum, event) => sum + event.gasUsd, 0);
    const successRate = (lpEvents.filter((e) => e.successful).length / lpEvents.length) * 100;

    const estimatedROI = totalInvested > 0
      ? ((totalInvested - totalGas) / totalInvested) * 100
      : 0;

    const payload = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalLPTransactions: lpEvents.length,
      totalInvestedUsd: +totalInvested.toFixed(2),
      totalGasSpentUsd: +totalGas.toFixed(4),
      successRate: +successRate.toFixed(2),
      estimatedROI: +estimatedROI.toFixed(2),
      recentEvents: lpEvents.slice(0, 10),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, payload, 60 * 1000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Liquidity provision ROI error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate LP ROI',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
