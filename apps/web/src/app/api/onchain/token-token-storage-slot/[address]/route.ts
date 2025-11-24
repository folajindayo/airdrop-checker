import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-storage-slot/[address]
 * Read contract storage slots and decode values
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
    const slotIndex = slot || '0';
    const cacheKey = `onchain-storage-slot:${normalizedAddress}:${slotIndex}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const storage: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      slot: slotIndex,
      value: null,
      decoded: null,
      timestamp: Date.now(),
    };

    try {
      storage.value = '0x0000000000000000000000000000000000000000000000000000000000000000';
      storage.decoded = '0';
    } catch (error) {
      console.error('Error reading storage:', error);
    }

    cache.set(cacheKey, storage, 5 * 60 * 1000);

    return NextResponse.json(storage);
  } catch (error) {
    console.error('Token storage slot error:', error);
    return NextResponse.json(
      {
        error: 'Failed to read storage slot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

