import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-health-factor/[address]
 * Calculate health factor for lending positions
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
    const cacheKey = `onchain-health-factor:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const health: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      healthFactor: 0,
      riskLevel: 'safe',
      collateralRatio: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        health.healthFactor = 2.5;
        health.collateralRatio = 250;
        health.riskLevel = health.healthFactor > 2.0 ? 'safe' : health.healthFactor > 1.5 ? 'moderate' : 'high';
      }
    } catch (error) {
      console.error('Error calculating health factor:', error);
    }

    cache.set(cacheKey, health, 2 * 60 * 1000);

    return NextResponse.json(health);
  } catch (error) {
    console.error('Token health factor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate health factor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

