import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-holder-lifecycle-tracker/[address]
 * Track holder lifecycle stages
 * Categorizes holders by lifecycle phase
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
    const cacheKey = `onchain-lifecycle:${normalizedAddress}:${chainId}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = parseInt(chainId);

    const lifecycle: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      stages: {
        new: 0,
        active: 0,
        dormant: 0,
        churned: 0,
      },
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
        const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
        const quarterAgo = now - (90 * 24 * 60 * 60 * 1000);
        
        holders.forEach((h: any) => {
          const firstTx = h.first_transaction_date;
          const lastTx = h.last_transaction_date;
          
          if (!firstTx) return;
          
          const firstTxTime = new Date(firstTx).getTime();
          const lastTxTime = lastTx ? new Date(lastTx).getTime() : 0;
          
          if (firstTxTime > weekAgo) {
            lifecycle.stages.new++;
          } else if (lastTxTime > monthAgo) {
            lifecycle.stages.active++;
          } else if (lastTxTime > quarterAgo) {
            lifecycle.stages.dormant++;
          } else {
            lifecycle.stages.churned++;
          }
        });
      }
    } catch (error) {
      console.error('Error tracking lifecycle:', error);
    }

    cache.set(cacheKey, lifecycle, 15 * 60 * 1000);

    return NextResponse.json(lifecycle);
  } catch (error) {
    console.error('Lifecycle tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track holder lifecycle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

