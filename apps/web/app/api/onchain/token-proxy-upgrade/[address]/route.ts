import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-proxy-upgrade/[address]
 * Track proxy contract upgrades and implementation changes
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
    const cacheKey = `onchain-proxy-upgrade:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const tracking: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      isProxy: false,
      upgradeHistory: [],
      currentImplementation: null,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const upgradeTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('upgrade') ||
            event.decoded?.name?.toLowerCase().includes('implementation')
          )
        );
        
        tracking.isProxy = upgradeTxs.length > 0;
        tracking.upgradeHistory = upgradeTxs.map((tx: any) => ({
          block: tx.block_number,
          date: tx.block_signed_at,
          newImplementation: tx.to_address,
        }));
        
        if (upgradeTxs.length > 0) {
          tracking.currentImplementation = upgradeTxs[0].to_address;
        }
      }
    } catch (error) {
      console.error('Error tracking proxy upgrades:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Proxy upgrade tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track proxy upgrades',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






