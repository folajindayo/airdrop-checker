import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-risk-assessment-engine/[address]
 * Comprehensive risk assessment for token investments
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
    const cacheKey = `onchain-risk-assessment:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const assessment: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      overallRisk: 0,
      riskFactors: [],
      safetyScore: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        assessment.overallRisk = liquidity < 100000 ? 65 : 25;
        assessment.safetyScore = 100 - assessment.overallRisk;
        if (liquidity < 100000) {
          assessment.riskFactors.push('low_liquidity');
        }
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
    }

    cache.set(cacheKey, assessment, 5 * 60 * 1000);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Risk assessment engine error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess token risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

