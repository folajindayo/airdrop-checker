import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-market-maker-score/[address]
 * Calculate market maker activity score
 * Measures liquidity provision quality
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId') || '1';

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-mm-score:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const mmScore: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      marketMakerScore: 0,
      liquidityDepth: 0,
      spreadTightness: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/pools/`,
        { 'quote-currency': 'USD', 'page-size': 10 }
      );

      if (response.data?.items && response.data.items.length > 0) {
        const pools = response.data.items;
        const totalLiquidity = pools.reduce((sum: number, p: any) => 
          sum + parseFloat(p.total_liquidity_quote || '0'), 0);
        
        mmScore.liquidityDepth = totalLiquidity;
        mmScore.marketMakerScore = Math.min((totalLiquidity / 1000000) * 100, 100);
        
        if (pools.length > 1) {
          const spreads = pools.map((p: any) => {
            const fee = parseFloat(p.fee_tier || '0.003');
            return fee * 100;
          });
          mmScore.spreadTightness = spreads.reduce((a, b) => a + b, 0) / spreads.length;
        }
      }
    } catch (error) {
      console.error('Error calculating MM score:', error);
    }

    cache.set(cacheKey, mmScore, 10 * 60 * 1000);

    return NextResponse.json(mmScore);
  } catch (error) {
    console.error('Market maker score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate market maker score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

