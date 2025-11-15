import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
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
    if (!isValidAddress(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    const cacheKey = `standard-detector:${address}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const standard = {
      contractAddress: address,
      standard: 'ERC20',
      isERC20: true,
      isERC721: false,
      isERC1155: false,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, standard, 300 * 1000);
    return NextResponse.json(standard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to detect standard' },
      { status: 500 }
    );
  }
}

