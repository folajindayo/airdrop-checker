import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-multisig-approval/[address]
 * Track multisig approval requirements and status
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
    const cacheKey = `onchain-multisig-approval:${normalizedAddress}:${chainId || 'all'}`;
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
      isMultisig: false,
      threshold: 0,
      owners: [],
      pendingApprovals: [],
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const multisigTxs = response.data.items.filter((tx: any) => 
          tx.log_events?.some((event: any) => 
            event.decoded?.name?.toLowerCase().includes('approval') ||
            event.decoded?.name?.toLowerCase().includes('confirmation')
          )
        );
        
        tracking.isMultisig = multisigTxs.length > 0;
        tracking.threshold = multisigTxs.length > 0 ? 2 : 0;
        tracking.owners = multisigTxs.map((tx: any) => tx.from_address);
      }
    } catch (error) {
      console.error('Error tracking multisig approvals:', error);
    }

    cache.set(cacheKey, tracking, 5 * 60 * 1000);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Multisig approval tracker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track multisig approvals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






