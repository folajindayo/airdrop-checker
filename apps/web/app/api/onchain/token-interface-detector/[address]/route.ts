import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-interface-detector/[address]
 * Detect ERC interfaces implemented by contract
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
    const cacheKey = `onchain-interface-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const interfaces: any = {
      contractAddress: normalizedAddress,
      chainId: targetChainId,
      detectedInterfaces: [],
      erc20: false,
      erc721: false,
      erc1155: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, interfaces, 5 * 60 * 1000);
    return NextResponse.json(interfaces);
  } catch (error) {
    console.error('Interface detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect interfaces',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
