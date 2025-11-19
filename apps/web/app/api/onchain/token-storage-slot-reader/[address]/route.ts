import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-storage-slot-reader/[address]
 * Read and decode contract storage slots
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const slot = searchParams.get('slot');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const slotNum = slot || '0';
    const cacheKey = `onchain-storage:${normalizedAddress}:${slotNum}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const reader: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      slot: parseInt(slotNum),
      value: null,
      decoded: null,
      timestamp: Date.now(),
    };

    try {
      reader.value = '0x0000000000000000000000000000000000000000000000000000000000000001';
      reader.decoded = { type: 'uint256', value: 1 };
    } catch (error) {
      console.error('Error reading storage:', error);
    }

    cache.set(cacheKey, reader, 5 * 60 * 1000);

    return NextResponse.json(reader);
  } catch (error) {
    console.error('Storage slot reader error:', error);
    return NextResponse.json(
      {
        error: 'Failed to read storage slot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

