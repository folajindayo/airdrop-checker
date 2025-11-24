import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-ownership-concentration/[address]
 * Calculate ownership concentration metrics
 * Measures token distribution inequality
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-ownership-concentration:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const concentration: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      top10Percent: 0,
      top50Percent: 0,
      giniCoefficient: 0,
      herfindahlIndex: 0,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const balances = holders.map((h: any) => parseFloat(h.balance || '0'));
        const totalSupply = balances.reduce((sum, b) => sum + b, 0);

        if (totalSupply > 0) {
          const sortedBalances = [...balances].sort((a, b) => b - a);
          const top10Balance = sortedBalances.slice(0, 10).reduce((sum, b) => sum + b, 0);
          const top50Balance = sortedBalances.slice(0, Math.min(50, sortedBalances.length))
            .reduce((sum, b) => sum + b, 0);

          concentration.top10Percent = (top10Balance / totalSupply) * 100;
          concentration.top50Percent = (top50Balance / totalSupply) * 100;
          concentration.giniCoefficient = calculateGini(sortedBalances, totalSupply);
          concentration.herfindahlIndex = calculateHerfindahl(balances, totalSupply);
          concentration.riskLevel = assessConcentrationRisk(concentration);
        }
      }
    } catch (error) {
      console.error('Error calculating concentration:', error);
    }

    cache.set(cacheKey, concentration, 5 * 60 * 1000);

    return NextResponse.json(concentration);
  } catch (error) {
    console.error('Ownership concentration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate ownership concentration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateGini(balances: number[], total: number): number {
  if (balances.length === 0 || total === 0) return 0;
  const n = balances.length;
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * balances[i];
  }
  return numerator / (n * total);
}

function calculateHerfindahl(balances: number[], total: number): number {
  if (total === 0) return 0;
  return balances.reduce((sum, balance) => {
    const share = balance / total;
    return sum + (share * share);
  }, 0);
}

function assessConcentrationRisk(concentration: any): string {
  if (concentration.top10Percent > 70 || concentration.giniCoefficient > 0.8) return 'very_high';
  if (concentration.top10Percent > 50 || concentration.giniCoefficient > 0.6) return 'high';
  if (concentration.top10Percent > 30) return 'medium';
  return 'low';
}

