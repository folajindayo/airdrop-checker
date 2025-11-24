import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-flash-loan-analyzer/[address]
 * Analyze flash loan usage and opportunities
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
    const cacheKey = `onchain-flash-loan:${normalizedAddress}:${chainId || 'all'}`;
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
      flashLoanCount: 0,
      totalVolume: 0,
      protocols: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        const flashLoanTxs = response.data.items.filter((tx: any) => 
          tx.to_address && tx.to_address.toLowerCase().includes('aave'));
        analysis.flashLoanCount = flashLoanTxs.length;
        analysis.totalVolume = flashLoanTxs.reduce((sum: number, tx: any) => 
          sum + parseFloat(tx.value_quote || '0'), 0);
        analysis.protocols = ['Aave', 'dYdX'];
      }
    } catch (error) {
      console.error('Error analyzing flash loans:', error);
    }

    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Flash loan analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze flash loan usage',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

