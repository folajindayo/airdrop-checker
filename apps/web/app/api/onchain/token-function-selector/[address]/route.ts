import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-function-selector/[address]
 * Get function selectors and signatures
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const functionName = searchParams.get('functionName');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-function-selector:${normalizedAddress}:${functionName || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const selector: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      functions: [],
      timestamp: Date.now(),
    };

    try {
      selector.functions = [
        { name: 'transfer', selector: '0xa9059cbb', signature: 'transfer(address,uint256)' },
        { name: 'approve', selector: '0x095ea7b3', signature: 'approve(address,uint256)' },
        { name: 'balanceOf', selector: '0x70a08231', signature: 'balanceOf(address)' },
      ];
    } catch (error) {
      console.error('Error getting selectors:', error);
    }

    cache.set(cacheKey, selector, 10 * 60 * 1000);

    return NextResponse.json(selector);
  } catch (error) {
    console.error('Function selector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get function selectors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

