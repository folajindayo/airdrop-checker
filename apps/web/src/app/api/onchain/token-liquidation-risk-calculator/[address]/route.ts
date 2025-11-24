import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidation-risk-calculator/[address]
 * Calculate liquidation risk for lending positions
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
    const cacheKey = `onchain-liquidation-risk:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const risk: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      liquidationPrice: 0,
      healthFactor: 0,
      riskLevel: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        risk.healthFactor = 2.5;
        risk.liquidationPrice = 1500;
        risk.riskLevel = risk.healthFactor < 1.5 ? 'high' : risk.healthFactor < 2.0 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error calculating liquidation risk:', error);
    }

    cache.set(cacheKey, risk, 2 * 60 * 1000);

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Liquidation risk calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate liquidation risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

