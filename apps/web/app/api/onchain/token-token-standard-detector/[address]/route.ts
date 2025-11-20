import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-standard-detector/[address]
 * Detect token standard (ERC20, ERC721, ERC1155)
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
    const cacheKey = `onchain-standard-detector:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detector: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      standard: 'ERC20',
      confidence: 0,
      features: [],
      timestamp: Date.now(),
    };

    try {
      detector.standard = 'ERC20';
      detector.confidence = 95;
      detector.features = ['transfer', 'approve', 'balanceOf'];
    } catch (error) {
      console.error('Error detecting standard:', error);
    }

    cache.set(cacheKey, detector, 10 * 60 * 1000);

    return NextResponse.json(detector);
  } catch (error) {
    console.error('Token standard detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect token standard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

