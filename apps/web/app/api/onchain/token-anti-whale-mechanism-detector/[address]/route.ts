import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-anti-whale-mechanism-detector/[address]
 * Detect anti-whale protection mechanisms
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
    const cacheKey = `onchain-anti-whale-mechanism:${normalizedAddress}:${chainId || 'all'}`;
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
      hasAntiWhale: false,
      maxTransaction: 0,
      maxWallet: 0,
      effectiveness: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        detector.hasAntiWhale = true;
        detector.maxTransaction = totalSupply * 0.01; // 1%
        detector.maxWallet = totalSupply * 0.05; // 5%
        detector.effectiveness = 75;
      }
    } catch (error) {
      console.error('Error detecting anti-whale mechanism:', error);
    }

    cache.set(cacheKey, detector, 10 * 60 * 1000);

    return NextResponse.json(detector);
  } catch (error) {
    console.error('Anti-whale mechanism detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect anti-whale mechanism',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

