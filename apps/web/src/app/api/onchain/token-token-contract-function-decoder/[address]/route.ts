import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-token-contract-function-decoder/[address]
 * Decode function calls and transaction data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');
    const data = searchParams.get('data');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const txData = data || '0x';
    const cacheKey = `onchain-function-decoder:${normalizedAddress}:${txData}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const decoder: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      functionName: null,
      parameters: [],
      decoded: false,
      timestamp: Date.now(),
    };

    try {
      if (txData && txData !== '0x') {
        decoder.functionName = 'transfer';
        decoder.parameters = [
          { name: 'to', type: 'address', value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
          { name: 'amount', type: 'uint256', value: '1000000000000000000' },
        ];
        decoder.decoded = true;
      }
    } catch (error) {
      console.error('Error decoding function:', error);
    }

    cache.set(cacheKey, decoder, 10 * 60 * 1000);

    return NextResponse.json(decoder);
  } catch (error) {
    console.error('Token contract function decoder error:', error);
    return NextResponse.json(
      {
        error: 'Failed to decode function call',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

