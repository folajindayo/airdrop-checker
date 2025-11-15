import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-concentration-risk/[address]
 * Assess concentration risk for token
 * Evaluates market manipulation risk
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
    const cacheKey = `onchain-concentration-risk:${normalizedAddress}:${chainId || 'all'}`;
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
      topHolderPercent: 0,
      manipulationRisk: 'low',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const totalSupply = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.balance || '0'), 0);
        
        if (totalSupply > 0 && holders.length > 0) {
          const topHolder = parseFloat(holders[0].balance || '0');
          risk.topHolderPercent = (topHolder / totalSupply) * 100;
          risk.riskScore = Math.min(100, risk.topHolderPercent * 1.5);
          risk.manipulationRisk = risk.topHolderPercent > 50 ? 'very_high' :
                                 risk.topHolderPercent > 30 ? 'high' :
                                 risk.topHolderPercent > 10 ? 'medium' : 'low';
        }
      }
    } catch (error) {
      console.error('Error assessing risk:', error);
    }

    cache.set(cacheKey, risk, 5 * 60 * 1000);

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Concentration risk error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assess concentration risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
