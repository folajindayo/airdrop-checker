import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-transfer-rate/[address]
 * Calculate token transfer rate and velocity
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
    const cacheKey = `onchain-transfer-rate:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const transferRate: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      transferRate: 0,
      velocity: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const volume24h = parseFloat(response.data.volume_24h || '0');
        const totalSupply = parseFloat(response.data.total_supply || '1');
        transferRate.transferRate = volume24h / totalSupply;
        transferRate.velocity = transferRate.transferRate * 365;
      }
    } catch (error) {
      console.error('Error calculating transfer rate:', error);
    }

    cache.set(cacheKey, transferRate, 5 * 60 * 1000);

    return NextResponse.json(transferRate);
  } catch (error) {
    console.error('Transfer rate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate transfer rate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}






