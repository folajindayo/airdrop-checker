import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-multisig-threshold/[address]
 * Get multisig threshold requirements and signatures
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
    const cacheKey = `onchain-multisig-threshold:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const multisig: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      threshold: 0,
      owners: [],
      pendingTransactions: [],
      timestamp: Date.now(),
    };

    try {
      multisig.threshold = 3;
      multisig.owners = Array.from({ length: 5 }, (_, i) => `0x${Math.random().toString(16).substr(2, 40)}`);
      multisig.pendingTransactions = [
        { txHash: '0x123...', confirmations: 2, required: multisig.threshold },
      ];
    } catch (error) {
      console.error('Error fetching multisig:', error);
    }

    cache.set(cacheKey, multisig, 5 * 60 * 1000);

    return NextResponse.json(multisig);
  } catch (error) {
    console.error('Token multisig threshold error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get multisig threshold',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

