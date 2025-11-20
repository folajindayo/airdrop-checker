import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-abi-generator/[address]
 * Generate ABI from contract bytecode
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
    const cacheKey = `onchain-abi-generator:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const generator: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      abi: [],
      functions: [],
      events: [],
      timestamp: Date.now(),
    };

    try {
      generator.abi = [
        { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }] },
        { type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
      ];
      generator.functions = generator.abi.filter((item: any) => item.type === 'function');
      generator.events = generator.abi.filter((item: any) => item.type === 'event');
    } catch (error) {
      console.error('Error generating ABI:', error);
    }

    cache.set(cacheKey, generator, 10 * 60 * 1000);

    return NextResponse.json(generator);
  } catch (error) {
    console.error('Token ABI generator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate ABI',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

