import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-staking-compound-calculator/[address]
 * Calculate compound interest for staking positions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const principal = parseFloat(searchParams.get('principal') || '1000');
    const apy = parseFloat(searchParams.get('apy') || '10');
    const days = parseInt(searchParams.get('days') || '365');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-staking-compound:${normalizedAddress}:${principal}:${apy}:${days}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;
    const dailyRate = apy / 100 / 365;
    const finalAmount = principal * Math.pow(1 + dailyRate, days);
    const totalInterest = finalAmount - principal;

    const calculator = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      principal,
      apy,
      days,
      finalAmount: parseFloat(finalAmount.toFixed(6)),
      totalInterest: parseFloat(totalInterest.toFixed(6)),
      roi: parseFloat(((totalInterest / principal) * 100).toFixed(2)),
      timestamp: Date.now(),
    };

    cache.set(cacheKey, calculator, 60 * 60 * 1000);

    return NextResponse.json(calculator);
  } catch (error) {
    console.error('Staking compound calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate compound interest',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

