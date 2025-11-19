import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-maker-activity/[address]
 * Detect market maker activity patterns
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
    const cacheKey = `onchain-mm-activity:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const mmActivity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      mmActivityScore: 0,
      mmPresence: 'low',
      liquidityProviderCount: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        mmActivity.mmActivityScore = Math.min((liquidity / 500000) * 100, 100);
        mmActivity.mmPresence = mmActivity.mmActivityScore > 70 ? 'high' :
                               mmActivity.mmActivityScore > 40 ? 'medium' : 'low';
      }
    } catch (error) {
      console.error('Error detecting MM activity:', error);
    }

    cache.set(cacheKey, mmActivity, 5 * 60 * 1000);

    return NextResponse.json(mmActivity);
  } catch (error) {
    console.error('Market maker activity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect market maker activity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





