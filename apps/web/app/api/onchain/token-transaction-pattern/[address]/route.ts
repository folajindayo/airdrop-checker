import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transaction-pattern/[address]
 * Analyze transaction patterns and behaviors
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
    const cacheKey = `onchain-tx-pattern:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const pattern: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      transactionCount24h: 0,
      averageTxSize: 0,
      patternType: 'normal',
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        pattern.transactionCount24h = parseFloat(response.data.transactions_24h || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        pattern.averageTxSize = pattern.transactionCount24h > 0 ? 
          volume / pattern.transactionCount24h : 0;
        pattern.patternType = pattern.transactionCount24h > 1000 ? 'high_frequency' :
                             pattern.transactionCount24h > 100 ? 'normal' : 'low_frequency';
      }
    } catch (error) {
      console.error('Error analyzing pattern:', error);
    }

    cache.set(cacheKey, pattern, 5 * 60 * 1000);

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Transaction pattern error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transaction pattern',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






