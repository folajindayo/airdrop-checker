import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-utility-score/[address]
 * Calculate token utility and usage score
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
    const cacheKey = `onchain-utility-score:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const utility: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      utilityScore: 0,
      transactionActivity: 0,
      holderActivity: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const txCount = parseFloat(response.data.transactions_24h || '0');
        const volume = parseFloat(response.data.volume_24h || '0');
        utility.transactionActivity = txCount;
        utility.holderActivity = volume > 0 ? Math.min((txCount / 1000) * 100, 100) : 0;
        utility.utilityScore = (utility.transactionActivity + utility.holderActivity) / 2;
      }
    } catch (error) {
      console.error('Error calculating utility:', error);
    }

    cache.set(cacheKey, utility, 5 * 60 * 1000);

    return NextResponse.json(utility);
  } catch (error) {
    console.error('Utility score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate utility score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

