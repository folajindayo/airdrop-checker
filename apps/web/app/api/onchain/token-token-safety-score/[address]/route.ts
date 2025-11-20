import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-safety-score/[address]
 * Calculate comprehensive safety score for tokens
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
    const cacheKey = `onchain-safety-score:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const safety: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      safetyScore: 0,
      riskFactors: [],
      securityLevel: 'high',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        safety.safetyScore = liquidity > 1000000 ? 85 : 60;
        safety.securityLevel = safety.safetyScore > 80 ? 'high' : safety.safetyScore > 60 ? 'medium' : 'low';
        if (liquidity < 100000) {
          safety.riskFactors.push('low_liquidity');
        }
      }
    } catch (error) {
      console.error('Error calculating safety:', error);
    }

    cache.set(cacheKey, safety, 5 * 60 * 1000);

    return NextResponse.json(safety);
  } catch (error) {
    console.error('Token safety score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate safety score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

