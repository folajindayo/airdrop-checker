import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-loyalty-score/[address]
 * Calculate holder loyalty scores
 * Measures long-term commitment
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
    const cacheKey = `onchain-loyalty-score:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const loyalty: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      averageLoyaltyScore: 0,
      loyalHolders: 0,
      retentionRate: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/token_holders/`,
        { 'quote-currency': 'USD', 'page-size': 100 }
      );

      if (response.data?.items) {
        const holders = response.data.items;
        const now = Date.now();
        let totalScore = 0;
        let loyalCount = 0;
        
        holders.forEach((h: any) => {
          const firstTx = h.first_transaction_date;
          const lastTx = h.last_transaction_date;
          
          if (firstTx && lastTx) {
            const daysHeld = (now - new Date(firstTx).getTime()) / (1000 * 60 * 60 * 24);
            const daysSinceLastTx = (now - new Date(lastTx).getTime()) / (1000 * 60 * 60 * 24);
            
            const score = Math.min(daysHeld / 365 * 50 + (daysSinceLastTx < 30 ? 50 : 0), 100);
            totalScore += score;
            
            if (score > 70) loyalCount++;
          }
        });
        
        loyalty.averageLoyaltyScore = holders.length > 0 ? totalScore / holders.length : 0;
        loyalty.loyalHolders = loyalCount;
        loyalty.retentionRate = holders.length > 0 ? (loyalCount / holders.length) * 100 : 0;
      }
    } catch (error) {
      console.error('Error calculating loyalty:', error);
    }

    cache.set(cacheKey, loyalty, 15 * 60 * 1000);

    return NextResponse.json(loyalty);
  } catch (error) {
    console.error('Loyalty score error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate loyalty score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

