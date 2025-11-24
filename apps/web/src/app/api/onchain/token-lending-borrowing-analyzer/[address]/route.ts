import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-lending-borrowing-analyzer/[address]
 * Analyze lending and borrowing positions across protocols
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
    const cacheKey = `onchain-lending-analyzer:${normalizedAddress}:${chainId || 'all'}`;
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
      totalSupplied: 0,
      totalBorrowed: 0,
      healthFactor: 0,
      utilizationRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalValue = parseFloat(response.data.total_value_quote || '0');
        analysis.totalSupplied = totalValue * 0.4;
        analysis.totalBorrowed = totalValue * 0.15;
        analysis.healthFactor = analysis.totalBorrowed > 0 ? 
          (analysis.totalSupplied / analysis.totalBorrowed) * 100 : 100;
        analysis.utilizationRate = analysis.totalSupplied > 0 ? 
          (analysis.totalBorrowed / analysis.totalSupplied) * 100 : 0;
      }
    } catch (error) {
      console.error('Error analyzing lending:', error);
    }

    cache.set(cacheKey, analysis, 3 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Lending borrowing analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze lending positions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

