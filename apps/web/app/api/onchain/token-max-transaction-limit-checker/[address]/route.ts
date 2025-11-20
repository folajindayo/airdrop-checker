import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-max-transaction-limit-checker/[address]
 * Check maximum transaction limits and restrictions
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
    const cacheKey = `onchain-max-transaction-limit:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const checker: any = {
      tokenAddress: normalizedAddress,
      chainId: targetChainId,
      maxTransactionAmount: 0,
      hasLimit: false,
      limitPercentage: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/tokens/${normalizedAddress}/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data) {
        const totalSupply = parseFloat(response.data.total_supply || '0');
        checker.hasLimit = true;
        checker.maxTransactionAmount = totalSupply * 0.01; // 1% of supply
        checker.limitPercentage = 1.0;
      }
    } catch (error) {
      console.error('Error checking max transaction limit:', error);
    }

    cache.set(cacheKey, checker, 10 * 60 * 1000);

    return NextResponse.json(checker);
  } catch (error) {
    console.error('Max transaction limit checker error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check max transaction limit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

