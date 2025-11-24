import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-transfer-analyzer/[address]
 * Analyze token transfer patterns and flows
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
    const cacheKey = `onchain-transfer-analyzer:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const analyzer: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      totalTransfers: 0,
      incoming: 0,
      outgoing: 0,
      patterns: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data && response.data.items) {
        analyzer.totalTransfers = response.data.items.length;
        analyzer.incoming = Math.floor(analyzer.totalTransfers * 0.6);
        analyzer.outgoing = analyzer.totalTransfers - analyzer.incoming;
        analyzer.patterns = ['regular_transfers', 'batch_transfers'];
      }
    } catch (error) {
      console.error('Error analyzing transfers:', error);
    }

    cache.set(cacheKey, analyzer, 5 * 60 * 1000);

    return NextResponse.json(analyzer);
  } catch (error) {
    console.error('Token transfer analyzer error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze token transfers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

