import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-trading-intensity-analyzer/[address]
 * Analyze trading intensity and frequency
 * Measures market activity levels
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
    const cacheKey = `onchain-trading-intensity:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const intensity: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      intensityScore: 0,
      transactionsPerDay: 0,
      averageTradeSize: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const now = Date.now();
        const dayAgo = now - (24 * 60 * 60 * 1000);
        
        const recentTxs = transactions.filter((tx: any) => {
          const txDate = tx.block_signed_at;
          if (!txDate) return false;
          return new Date(txDate).getTime() > dayAgo;
        });
        
        intensity.transactionsPerDay = recentTxs.length;
        
        const sizes = transactions.map((tx: any) => 
          parseFloat(tx.value_quote || '0')).filter((s: number) => s > 0);
        
        if (sizes.length > 0) {
          intensity.averageTradeSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
        }
        
        intensity.intensityScore = Math.min(intensity.transactionsPerDay * 2, 100);
      }
    } catch (error) {
      console.error('Error analyzing intensity:', error);
    }

    cache.set(cacheKey, intensity, 5 * 60 * 1000);

    return NextResponse.json(intensity);
  } catch (error) {
    console.error('Trading intensity analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trading intensity',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

