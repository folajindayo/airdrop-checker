import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-standard-detector/[address]
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
      return NextResponse.json({ ...cachedResult, cached: true });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const standard: any = {
      contractAddress: normalizedAddress,
      chainId: targetChainId,
      detectedStandard: null,
      isERC20: false,
      isERC721: false,
      isERC1155: false,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        standard.detectedStandard = response.data.type || 'ERC20';
        standard.isERC20 = standard.detectedStandard === 'ERC20';
        standard.isERC721 = standard.detectedStandard === 'ERC721';
        standard.isERC1155 = standard.detectedStandard === 'ERC1155';
      }
    } catch (error) {
      console.error('Error detecting standard:', error);
    }

    cache.set(cacheKey, standard, 5 * 60 * 1000);
    return NextResponse.json(standard);
  } catch (error) {
    console.error('Standard detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect token standard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
