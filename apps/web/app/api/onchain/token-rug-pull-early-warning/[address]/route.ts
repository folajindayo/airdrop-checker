import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-rug-pull-early-warning/[address]
 * Early warning system for potential rug pulls
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
    const cacheKey = `onchain-rug-pull-warning:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const warning: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      riskLevel: 'low',
      warningSignals: [],
      confidence: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const signals: string[] = [];
        let riskScore = 0;

        if (!response.data.contract_name) {
          signals.push('Missing contract name');
          riskScore += 20;
        }

        if (parseFloat(response.data.total_supply || '0') < 1000000) {
          signals.push('Very low total supply');
          riskScore += 15;
        }

        if (parseFloat(response.data.total_liquidity_quote || '0') < 10000) {
          signals.push('Low liquidity');
          riskScore += 25;
        }

        warning.warningSignals = signals;
        warning.confidence = Math.min(riskScore, 100);
        warning.riskLevel = riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing rug pull risk:', error);
    }

    cache.set(cacheKey, warning, 5 * 60 * 1000);

    return NextResponse.json(warning);
  } catch (error) {
    console.error('Rug pull early warning error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze rug pull risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

