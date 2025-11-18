import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-acquisition-cost/[address]
 * Calculate cost to acquire new holders
 * Measures marketing efficiency
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
    const cacheKey = `onchain-acquisition-cost:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const acquisition: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      averageAcquisitionCost: 0,
      newHoldersRate: 0,
      growthEfficiency: 0,
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
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const newHolders = holders.filter((h: any) => {
          const firstTx = h.first_transaction_date;
          if (!firstTx) return false;
          return new Date(firstTx).getTime() > weekAgo;
        });
        
        acquisition.newHoldersRate = holders.length > 0 
          ? (newHolders.length / holders.length) * 100 
          : 0;
        
        const totalValue = holders.reduce((sum: number, h: any) => 
          sum + parseFloat(h.value || '0'), 0);
        
        if (newHolders.length > 0 && totalValue > 0) {
          acquisition.averageAcquisitionCost = totalValue / holders.length;
          acquisition.growthEfficiency = newHolders.length / (totalValue / 1000000);
        }
      }
    } catch (error) {
      console.error('Error calculating acquisition:', error);
    }

    cache.set(cacheKey, acquisition, 15 * 60 * 1000);

    return NextResponse.json(acquisition);
  } catch (error) {
    console.error('Acquisition cost error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate acquisition cost',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

