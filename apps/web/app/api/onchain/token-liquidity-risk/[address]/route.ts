import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-liquidity-risk/[address]
 * Assess liquidity risk factors
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
    const cacheKey = `onchain-liquidity-risk:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const risk: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      riskScore: 0,
      riskLevel: 'low',
      liquidityDepth: 0,
      slippageRisk: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        risk.liquidityDepth = liquidity;
        risk.riskScore = liquidity > 1000000 ? 10 :
                        liquidity > 100000 ? 30 :
                        liquidity > 10000 ? 60 : 90;
        risk.riskLevel = risk.riskScore > 70 ? 'high' :
                        risk.riskScore > 40 ? 'medium' : 'low';
        risk.slippageRisk = risk.riskLevel;
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
    }

    cache.set(cacheKey, risk, 5 * 60 * 1000);

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Liquidity risk error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess liquidity risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






