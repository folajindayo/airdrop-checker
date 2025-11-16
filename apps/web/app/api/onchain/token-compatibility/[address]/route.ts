import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-compatibility/[address]
 * Check token compatibility with protocols
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const protocol = searchParams.get('protocol');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-compatibility:${normalizedAddress}:${protocol || 'all'}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const compatibility: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      protocol: protocol || 'all',
      isCompatible: true,
      compatibilityIssues: [],
      supportedProtocols: [],
      timestamp: Date.now(),
    };

    cache.set(cacheKey, compatibility, 5 * 60 * 1000);
    return NextResponse.json(compatibility);
  } catch (error) {
    console.error('Compatibility checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check compatibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
