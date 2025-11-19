import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-bridge-risk-analyzer/[address]
 * Analyze bridge transaction risks with security scoring
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
    const cacheKey = `onchain-bridge-risk:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analysis: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      riskScore: 0,
      riskLevel: 'low',
      riskFactors: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        let score = 0;
        const factors: string[] = [];
        
        transactions.forEach((tx: any) => {
          if (tx.value_quote && parseFloat(tx.value_quote) > 100000) {
            score += 15;
            factors.push('Large bridge amount');
          }
          if (!tx.successful) {
            score += 20;
            factors.push('Failed bridge transaction');
          }
        });
        
        analysis.riskScore = score;
        analysis.riskFactors = factors;
        analysis.riskLevel = score > 30 ? 'high' : score > 15 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error analyzing bridge risk:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Bridge risk analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze bridge risk',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





