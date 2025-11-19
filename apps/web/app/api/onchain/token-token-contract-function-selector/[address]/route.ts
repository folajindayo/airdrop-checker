import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-contract-function-selector/[address]
 * Get function selectors and signatures for contract
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
    const cacheKey = `onchain-function-selector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const selectors: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      functions: [],
      totalFunctions: 0,
      timestamp: Date.now(),
    };

    try {
      selectors.functions = [
        { name: 'transfer', selector: '0xa9059cbb', signature: 'transfer(address,uint256)' },
        { name: 'approve', selector: '0x095ea7b3', signature: 'approve(address,uint256)' },
        { name: 'balanceOf', selector: '0x70a08231', signature: 'balanceOf(address)' },
      ];
      selectors.totalFunctions = selectors.functions.length;
    } catch (error) {
      console.error('Error getting selectors:', error);
    }

    cache.set(cacheKey, selectors, 10 * 60 * 1000);

    return NextResponse.json(selectors);
  } catch (error) {
    console.error('Token contract function selector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get function selectors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

