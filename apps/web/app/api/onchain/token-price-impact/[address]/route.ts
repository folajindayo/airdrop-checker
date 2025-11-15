import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-price-impact/[address]
 * Calculate price impact for token trades
 * Estimates slippage for large orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const amount = searchParams.get('amount');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const tradeAmount = parseFloat(amount || '1000');
    const cacheKey = `onchain-price-impact:${normalizedAddress}:${chainId || 'all'}:${tradeAmount}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const impact: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      tradeAmount: tradeAmount,
      estimatedPriceImpact: 0,
      slippageRisk: 'low',
      liquidityDepth: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const liquidity = parseFloat(response.data.total_liquidity_quote || '0');
        impact.liquidityDepth = liquidity;
        
        if (liquidity > 0) {
          impact.estimatedPriceImpact = (tradeAmount / liquidity) * 100;
          impact.slippageRisk = impact.estimatedPriceImpact > 5 ? 'high' :
                               impact.estimatedPriceImpact > 2 ? 'medium' : 'low';
        }
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
    }

    cache.set(cacheKey, impact, 2 * 60 * 1000);

    return NextResponse.json(impact);
  } catch (error) {
    console.error('Price impact calculation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate price impact',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
