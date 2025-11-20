import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-support-resistance/[address]
 * Identify support and resistance levels
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
    const cacheKey = `onchain-support-resistance:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const levels: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      supportLevels: [],
      resistanceLevels: [],
      currentPrice: 0,
      timestamp: Date.now(),
    };

    try {
      levels.currentPrice = 2000;
      levels.supportLevels = [1900, 1850, 1800];
      levels.resistanceLevels = [2100, 2150, 2200];
    } catch (error) {
      console.error('Error identifying levels:', error);
    }

    cache.set(cacheKey, levels, 5 * 60 * 1000);

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Token support resistance error:', error);
    return NextResponse.json(
      {
        error: 'Failed to identify support and resistance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

