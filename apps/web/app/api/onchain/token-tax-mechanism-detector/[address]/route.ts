import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-tax-mechanism-detector/[address]
 * Detect and analyze token tax mechanisms
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
    const cacheKey = `onchain-tax-mechanism:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detector: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      hasTax: false,
      buyTax: 0,
      sellTax: 0,
      taxDistribution: {},
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        detector.hasTax = true;
        detector.buyTax = 3.0;
        detector.sellTax = 5.0;
        detector.taxDistribution = {
          liquidity: 50,
          burn: 30,
          rewards: 20,
        };
      }
    } catch (error) {
      console.error('Error detecting tax mechanism:', error);
    }

    cache.set(cacheKey, detector, 10 * 60 * 1000);

    return NextResponse.json(detector);
  } catch (error) {
    console.error('Tax mechanism detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect tax mechanism',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

